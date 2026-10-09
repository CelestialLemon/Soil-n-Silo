(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`attached`,t=1e3,n=1001,r=1002,i=1003,a=1004,o=1005,s=1006,c=1007,l=1008,u=1009,d=1010,f=1011,p=1012,m=1013,h=1014,g=1015,_=1016,v=1017,y=1018,b=1020,x=35902,S=35899,C=1021,w=1022,T=1023,E=1026,D=1027,ee=1028,O=1029,k=1030,A=1031,te=1033,j=33776,M=33777,N=33778,P=33779,F=35840,I=35841,L=35842,ne=35843,re=36196,ie=37492,R=37496,ae=37808,oe=37809,se=37810,ce=37811,le=37812,ue=37813,de=37814,z=37815,fe=37816,pe=37817,me=37818,B=37819,he=37820,V=37821,ge=36492,_e=36494,ve=36495,ye=36283,be=36284,xe=36285,Se=36286,Ce=2300,we=2301,Te=2302,Ee=2400,De=2401,Oe=2402,ke=2500,Ae=3200,je=3201,Me=`srgb`,Ne=`srgb-linear`,Pe=`linear`,Fe=`srgb`,Ie=7680,Le=35044,Re=35048,ze=`300 es`,Be=2e3,Ve=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},He=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),Ue=1234567,We=Math.PI/180,Ge=180/Math.PI;function Ke(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(He[e&255]+He[e>>8&255]+He[e>>16&255]+He[e>>24&255]+`-`+He[t&255]+He[t>>8&255]+`-`+He[t>>16&15|64]+He[t>>24&255]+`-`+He[n&63|128]+He[n>>8&255]+`-`+He[n>>16&255]+He[n>>24&255]+He[r&255]+He[r>>8&255]+He[r>>16&255]+He[r>>24&255]).toLowerCase()}function H(e,t,n){return Math.max(t,Math.min(n,e))}function qe(e,t){return(e%t+t)%t}function Je(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function Ye(e,t,n){return e===t?0:(n-e)/(t-e)}function Xe(e,t,n){return(1-n)*e+n*t}function Ze(e,t,n,r){return Xe(e,t,1-Math.exp(-n*r))}function Qe(e,t=1){return t-Math.abs(qe(e,t*2)-t)}function $e(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function et(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function tt(e,t){return e+Math.floor(Math.random()*(t-e+1))}function nt(e,t){return e+Math.random()*(t-e)}function rt(e){return e*(.5-Math.random())}function it(e){e!==void 0&&(Ue=e);let t=Ue+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function at(e){return e*We}function ot(e){return e*Ge}function st(e){return!(e&e-1)&&e!==0}function ct(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function lt(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function ut(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:console.warn(`THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function dt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`Invalid component type.`)}}function ft(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`Invalid component type.`)}}var pt={DEG2RAD:We,RAD2DEG:Ge,generateUUID:Ke,clamp:H,euclideanModulo:qe,mapLinear:Je,inverseLerp:Ye,lerp:Xe,damp:Ze,pingpong:Qe,smoothstep:$e,smootherstep:et,randInt:tt,randFloat:nt,randFloatSpread:rt,seededRandom:it,degToRad:at,radToDeg:ot,isPowerOfTwo:st,ceilPowerOfTwo:ct,floorPowerOfTwo:lt,setQuaternionFromProperEuler:ut,normalize:ft,denormalize:dt},U=class e{constructor(t=0,n=0){e.prototype.isVector2=!0,this.x=t,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=H(this.x,e.x,t.x),this.y=H(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=H(this.x,e,t),this.y=H(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(H(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(H(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},mt=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(o===0){e[t+0]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u;return}if(o===1){e[t+0]=d,e[t+1]=f,e[t+2]=p,e[t+3]=m;return}if(u!==m||s!==d||c!==f||l!==p){let e=1-o,t=s*d+c*f+l*p+u*m,n=t>=0?1:-1,r=1-t*t;if(r>2**-52){let i=Math.sqrt(r),a=Math.atan2(i,t*n);e=Math.sin(e*a)/i,o=Math.sin(o*a)/i}let i=o*n;if(s=s*e+d*i,c=c*e+f*i,l=l*e+p*i,u=u*e+m*i,e===1-o){let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:console.warn(`THREE.Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(H(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,r=this._y,i=this._z,a=this._w,o=a*e._w+n*e._x+r*e._y+i*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=r,this._z=i,this;let s=1-o*o;if(s<=2**-52){let e=1-t;return this._w=e*a+t*this._w,this._x=e*n+t*this._x,this._y=e*r+t*this._y,this._z=e*i+t*this._z,this.normalize(),this}let c=Math.sqrt(s),l=Math.atan2(c,o),u=Math.sin((1-t)*l)/c,d=Math.sin(t*l)/c;return this._w=a*u+this._w*d,this._x=n*u+this._x*d,this._y=r*u+this._y*d,this._z=i*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},W=class e{constructor(t=0,n=0,r=0){e.prototype.isVector3=!0,this.x=t,this.y=n,this.z=r}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(gt.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(gt.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=H(this.x,e.x,t.x),this.y=H(this.y,e.y,t.y),this.z=H(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=H(this.x,e,t),this.y=H(this.y,e,t),this.z=H(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(H(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return ht.copy(this).projectOnVector(e),this.sub(ht)}reflect(e){return this.sub(ht.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(H(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},ht=new W,gt=new mt,G=class e{constructor(t,n,r,i,a,o,s,c,l){e.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(_t.makeScale(e,t)),this}rotate(e){return this.premultiply(_t.makeRotation(-e)),this}translate(e,t){return this.premultiply(_t.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},_t=new G;function vt(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function yt(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function bt(){let e=yt(`canvas`);return e.style.display=`block`,e}var xt={};function St(e){e in xt||(xt[e]=!0,console.warn(e))}function Ct(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var wt=new G().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Tt=new G().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Et(){let e={enabled:!0,workingColorSpace:Ne,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n?e:(this.spaces[t].transfer===`srgb`&&(e.r=Ot(e.r),e.g=Ot(e.g),e.b=Ot(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=kt(e.r),e.g=kt(e.g),e.b=kt(e.b)),e)},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Pe:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return St(`THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return St(`THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Ne]:{primaries:t,whitePoint:r,transfer:Pe,toXYZ:wt,fromXYZ:Tt,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Me},outputColorSpaceConfig:{drawingBufferColorSpace:Me}},[Me]:{primaries:t,whitePoint:r,transfer:Fe,toXYZ:wt,fromXYZ:Tt,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Me}}}),e}var Dt=Et();function Ot(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function kt(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var At,jt=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{At===void 0&&(At=yt(`canvas`)),At.width=e.width,At.height=e.height;let t=At.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=At}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=yt(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=Ot(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(Ot(t[e]/255)*255):t[e]=Ot(t[e]);return{data:t,width:e.width,height:e.height}}return console.warn(`THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Mt=0,Nt=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Mt++}),this.uuid=Ke(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Pt(r[t].image)):e.push(Pt(r[t]))}else e=Pt(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function Pt(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?jt.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(console.warn(`THREE.Texture: Unable to serialize Texture.`),{})}var Ft=0,It=new W,Lt=class e extends Ve{constructor(t=e.DEFAULT_IMAGE,r=e.DEFAULT_MAPPING,i=n,a=n,o=s,c=l,d=T,f=u,p=e.DEFAULT_ANISOTROPY,m=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ft++}),this.uuid=Ke(),this.name=``,this.source=new Nt(t),this.mipmaps=[],this.mapping=r,this.channel=0,this.wrapS=i,this.wrapT=a,this.magFilter=o,this.minFilter=c,this.anisotropy=p,this.format=d,this.internalFormat=null,this.type=f,this.offset=new U(0,0),this.repeat=new U(1,1),this.center=new U(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new G,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(It).x}get height(){return this.source.getSize(It).y}get depth(){return this.source.getSize(It).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case t:e.x-=Math.floor(e.x);break;case n:e.x=e.x<0?0:1;break;case r:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case t:e.y-=Math.floor(e.y);break;case n:e.y=e.y<0?0:1;break;case r:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Lt.DEFAULT_IMAGE=null,Lt.DEFAULT_MAPPING=300,Lt.DEFAULT_ANISOTROPY=1;var K=class e{constructor(t=0,n=0,r=0,i=1){e.prototype.isVector4=!0,this.x=t,this.y=n,this.z=r,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=H(this.x,e.x,t.x),this.y=H(this.y,e.y,t.y),this.z=H(this.z,e.z,t.z),this.w=H(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=H(this.x,e,t),this.y=H(this.y,e,t),this.z=H(this.z,e,t),this.w=H(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(H(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Rt=class extends Ve{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:s,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new K(0,0,e,t),this.scissorTest=!1,this.viewport=new K(0,0,e,t);let r=new Lt({width:e,height:t,depth:n.depth});this.textures=[];let i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:s,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isArrayTexture=this.textures[r].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Nt(n)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:`dispose`})}},zt=class extends Rt{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Bt=class extends Lt{constructor(e=null,t=1,r=1,a=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:r,depth:a},this.magFilter=i,this.minFilter=i,this.wrapR=n,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Vt=class extends Lt{constructor(e=null,t=1,r=1,a=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:r,depth:a},this.magFilter=i,this.minFilter=i,this.wrapR=n,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Ht=class{constructor(e=new W(1/0,1/0,1/0),t=new W(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Wt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Wt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Wt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,Wt):Wt.fromBufferAttribute(r,t),Wt.applyMatrix4(e.matrixWorld),this.expandByPoint(Wt);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),Gt.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),Gt.copy(e.boundingBox)),Gt.applyMatrix4(e.matrixWorld),this.union(Gt)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Wt),Wt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Qt),$t.subVectors(this.max,Qt),Kt.subVectors(e.a,Qt),qt.subVectors(e.b,Qt),Jt.subVectors(e.c,Qt),Yt.subVectors(qt,Kt),Xt.subVectors(Jt,qt),Zt.subVectors(Kt,Jt);let t=[0,-Yt.z,Yt.y,0,-Xt.z,Xt.y,0,-Zt.z,Zt.y,Yt.z,0,-Yt.x,Xt.z,0,-Xt.x,Zt.z,0,-Zt.x,-Yt.y,Yt.x,0,-Xt.y,Xt.x,0,-Zt.y,Zt.x,0];return!nn(t,Kt,qt,Jt,$t)||(t=[1,0,0,0,1,0,0,0,1],!nn(t,Kt,qt,Jt,$t))?!1:(en.crossVectors(Yt,Xt),t=[en.x,en.y,en.z],nn(t,Kt,qt,Jt,$t))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Wt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Wt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ut[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ut[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ut[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ut[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ut[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ut[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ut[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ut[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ut),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Ut=[new W,new W,new W,new W,new W,new W,new W,new W],Wt=new W,Gt=new Ht,Kt=new W,qt=new W,Jt=new W,Yt=new W,Xt=new W,Zt=new W,Qt=new W,$t=new W,en=new W,tn=new W;function nn(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){tn.fromArray(e,a);let o=i.x*Math.abs(tn.x)+i.y*Math.abs(tn.y)+i.z*Math.abs(tn.z),s=t.dot(tn),c=n.dot(tn),l=r.dot(tn);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var rn=new Ht,an=new W,on=new W,sn=class{constructor(e=new W,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?rn.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;an.subVectors(e,this.center);let t=an.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(an,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(on.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(an.copy(e.center).add(on)),this.expandByPoint(an.copy(e.center).sub(on))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},cn=new W,ln=new W,un=new W,dn=new W,fn=new W,pn=new W,mn=new W,hn=class{constructor(e=new W,t=new W(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,cn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=cn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(cn.copy(this.origin).addScaledVector(this.direction,t),cn.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){ln.copy(e).add(t).multiplyScalar(.5),un.copy(t).sub(e).normalize(),dn.copy(this.origin).sub(ln);let i=e.distanceTo(t)*.5,a=-this.direction.dot(un),o=dn.dot(this.direction),s=-dn.dot(un),c=dn.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(ln).addScaledVector(un,d),f}intersectSphere(e,t){cn.subVectors(e.center,this.origin);let n=cn.dot(this.direction),r=cn.dot(cn)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,cn)!==null}intersectTriangle(e,t,n,r,i){fn.subVectors(t,e),pn.subVectors(n,e),mn.crossVectors(fn,pn);let a=this.direction.dot(mn),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;dn.subVectors(this.origin,e);let s=o*this.direction.dot(pn.crossVectors(dn,pn));if(s<0)return null;let c=o*this.direction.dot(fn.cross(dn));if(c<0||s+c>a)return null;let l=-o*dn.dot(mn);return l<0?null:this.at(l/a,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},q=class e{constructor(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g){e.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,r=1/gn.setFromMatrixColumn(e,0).length(),i=1/gn.setFromMatrixColumn(e,1).length(),a=1/gn.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(vn,e,yn)}lookAt(e,t,n){let r=this.elements;return Sn.subVectors(e,t),Sn.lengthSq()===0&&(Sn.z=1),Sn.normalize(),bn.crossVectors(n,Sn),bn.lengthSq()===0&&(Math.abs(n.z)===1?Sn.x+=1e-4:Sn.z+=1e-4,Sn.normalize(),bn.crossVectors(n,Sn)),bn.normalize(),xn.crossVectors(Sn,bn),r[0]=bn.x,r[4]=xn.x,r[8]=Sn.x,r[1]=bn.y,r[5]=xn.y,r[9]=Sn.y,r[2]=bn.z,r[6]=xn.z,r[10]=Sn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],ee=r[13],O=r[2],k=r[6],A=r[10],te=r[14],j=r[3],M=r[7],N=r[11],P=r[15];return i[0]=a*x+o*T+s*O+c*j,i[4]=a*S+o*E+s*k+c*M,i[8]=a*C+o*D+s*A+c*N,i[12]=a*w+o*ee+s*te+c*P,i[1]=l*x+u*T+d*O+f*j,i[5]=l*S+u*E+d*k+f*M,i[9]=l*C+u*D+d*A+f*N,i[13]=l*w+u*ee+d*te+f*P,i[2]=p*x+m*T+h*O+g*j,i[6]=p*S+m*E+h*k+g*M,i[10]=p*C+m*D+h*A+g*N,i[14]=p*w+m*ee+h*te+g*P,i[3]=_*x+v*T+y*O+b*j,i[7]=_*S+v*E+y*k+b*M,i[11]=_*C+v*D+y*A+b*N,i[15]=_*w+v*ee+y*te+b*P,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15];return p*(+i*s*u-r*c*u-i*o*d+n*c*d+r*o*f-n*s*f)+m*(+t*s*f-t*c*d+i*a*d-r*a*f+r*c*l-i*s*l)+h*(+t*c*u-t*o*f-i*a*u+n*a*f+i*o*l-n*c*l)+g*(-r*o*l-t*s*u+t*o*d+r*a*u-n*a*d+n*s*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=u*h*c-m*d*c+m*s*f-o*h*f-u*s*g+o*d*g,v=p*d*c-l*h*c-p*s*f+a*h*f+l*s*g-a*d*g,y=l*m*c-p*u*c+p*o*f-a*m*f-l*o*g+a*u*g,b=p*u*s-l*m*s-p*o*d+a*m*d+l*o*h-a*u*h,x=t*_+n*v+r*y+i*b;if(x===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let S=1/x;return e[0]=_*S,e[1]=(m*d*i-u*h*i-m*r*f+n*h*f+u*r*g-n*d*g)*S,e[2]=(o*h*i-m*s*i+m*r*c-n*h*c-o*r*g+n*s*g)*S,e[3]=(u*s*i-o*d*i-u*r*c+n*d*c+o*r*f-n*s*f)*S,e[4]=v*S,e[5]=(l*h*i-p*d*i+p*r*f-t*h*f-l*r*g+t*d*g)*S,e[6]=(p*s*i-a*h*i-p*r*c+t*h*c+a*r*g-t*s*g)*S,e[7]=(a*d*i-l*s*i+l*r*c-t*d*c-a*r*f+t*s*f)*S,e[8]=y*S,e[9]=(p*u*i-l*m*i-p*n*f+t*m*f+l*n*g-t*u*g)*S,e[10]=(a*m*i-p*o*i+p*n*c-t*m*c-a*n*g+t*o*g)*S,e[11]=(l*o*i-a*u*i-l*n*c+t*u*c+a*n*f-t*o*f)*S,e[12]=b*S,e[13]=(l*m*r-p*u*r+p*n*d-t*m*d-l*n*h+t*u*h)*S,e[14]=(p*o*r-a*m*r-p*n*s+t*m*s+a*n*h-t*o*h)*S,e[15]=(a*u*r-l*o*r+l*n*s-t*u*s-a*n*d+t*o*d)*S,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements,i=gn.set(r[0],r[1],r[2]).length(),a=gn.set(r[4],r[5],r[6]).length(),o=gn.set(r[8],r[9],r[10]).length();this.determinant()<0&&(i=-i),e.x=r[12],e.y=r[13],e.z=r[14],_n.copy(this);let s=1/i,c=1/a,l=1/o;return _n.elements[0]*=s,_n.elements[1]*=s,_n.elements[2]*=s,_n.elements[4]*=c,_n.elements[5]*=c,_n.elements[6]*=c,_n.elements[8]*=l,_n.elements[9]*=l,_n.elements[10]*=l,t.setFromRotationMatrix(_n),n.x=i,n.y=a,n.z=o,this}makePerspective(e,t,n,r,i,a,o=Be,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=Be,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},gn=new W,_n=new q,vn=new W(0,0,0),yn=new W(1,1,1),bn=new W,xn=new W,Sn=new W,Cn=new q,wn=new mt,Tn=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(H(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-H(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(H(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-H(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(H(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-H(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:console.warn(`THREE.Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Cn.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Cn,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return wn.setFromEuler(this),this.setFromQuaternion(wn,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Tn.DEFAULT_ORDER=`XYZ`;var En=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&(1<<e|0))}},Dn=0,On=new W,kn=new mt,An=new q,jn=new W,Mn=new W,Nn=new W,Pn=new mt,Fn=new W(1,0,0),In=new W(0,1,0),Ln=new W(0,0,1),Rn={type:`added`},zn={type:`removed`},Bn={type:`childadded`,child:null},Vn={type:`childremoved`,child:null},Hn=class e extends Ve{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Dn++}),this.uuid=Ke(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new W,n=new Tn,r=new mt,i=new W(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new q},normalMatrix:{value:new G}}),this.matrix=new q,this.matrixWorld=new q,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new En,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return kn.setFromAxisAngle(e,t),this.quaternion.multiply(kn),this}rotateOnWorldAxis(e,t){return kn.setFromAxisAngle(e,t),this.quaternion.premultiply(kn),this}rotateX(e){return this.rotateOnAxis(Fn,e)}rotateY(e){return this.rotateOnAxis(In,e)}rotateZ(e){return this.rotateOnAxis(Ln,e)}translateOnAxis(e,t){return On.copy(e).applyQuaternion(this.quaternion),this.position.add(On.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Fn,e)}translateY(e){return this.translateOnAxis(In,e)}translateZ(e){return this.translateOnAxis(Ln,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(An.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?jn.copy(e):jn.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Mn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?An.lookAt(Mn,jn,this.up):An.lookAt(jn,Mn,this.up),this.quaternion.setFromRotationMatrix(An),r&&(An.extractRotation(r.matrixWorld),kn.setFromRotationMatrix(An),this.quaternion.premultiply(kn.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(console.error(`THREE.Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Rn),Bn.child=e,this.dispatchEvent(Bn),Bn.child=null):console.error(`THREE.Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(zn),Vn.child=e,this.dispatchEvent(Vn),Vn.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),An.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),An.multiply(e.parent.matrixWorld)),e.applyMatrix4(An),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Rn),Bn.child=e,this.dispatchEvent(Bn),Bn.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Mn,e,Nn),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Mn,Pn,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let e=this.children;for(let t=0,n=e.length;t<n;t++)e[t].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==``&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}};Hn.DEFAULT_UP=new W(0,1,0),Hn.DEFAULT_MATRIX_AUTO_UPDATE=!0,Hn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Un=new W,Wn=new W,Gn=new W,Kn=new W,qn=new W,Jn=new W,Yn=new W,Xn=new W,Zn=new W,Qn=new W,$n=new K,er=new K,tr=new K,nr=class e{constructor(e=new W,t=new W,n=new W){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Un.subVectors(e,t),r.cross(Un);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){Un.subVectors(r,t),Wn.subVectors(n,t),Gn.subVectors(e,t);let a=Un.dot(Un),o=Un.dot(Wn),s=Un.dot(Gn),c=Wn.dot(Wn),l=Wn.dot(Gn),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Kn)!==null&&Kn.x>=0&&Kn.y>=0&&Kn.x+Kn.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,Kn)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,Kn.x),s.addScaledVector(a,Kn.y),s.addScaledVector(o,Kn.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return $n.setScalar(0),er.setScalar(0),tr.setScalar(0),$n.fromBufferAttribute(e,t),er.fromBufferAttribute(e,n),tr.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector($n,i.x),a.addScaledVector(er,i.y),a.addScaledVector(tr,i.z),a}static isFrontFacing(e,t,n,r){return Un.subVectors(n,t),Wn.subVectors(e,t),Un.cross(Wn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Un.subVectors(this.c,this.b),Wn.subVectors(this.a,this.b),Un.cross(Wn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;qn.subVectors(r,n),Jn.subVectors(i,n),Xn.subVectors(e,n);let s=qn.dot(Xn),c=Jn.dot(Xn);if(s<=0&&c<=0)return t.copy(n);Zn.subVectors(e,r);let l=qn.dot(Zn),u=Jn.dot(Zn);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(qn,a);Qn.subVectors(e,i);let f=qn.dot(Qn),p=Jn.dot(Qn);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Jn,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return Yn.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(Yn,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(qn,a).addScaledVector(Jn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},rr={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ir={h:0,s:0,l:0},ar={h:0,s:0,l:0};function or(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var J=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Me){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Dt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=Dt.workingColorSpace){return this.r=e,this.g=t,this.b=n,Dt.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=Dt.workingColorSpace){if(e=qe(e,1),t=H(t,0,1),n=H(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=or(i,r,e+1/3),this.g=or(i,r,e),this.b=or(i,r,e-1/3)}return Dt.colorSpaceToWorking(this,r),this}setStyle(e,t=Me){function n(t){t!==void 0&&parseFloat(t)<1&&console.warn(`THREE.Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:console.warn(`THREE.Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);console.warn(`THREE.Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Me){let n=rr[e.toLowerCase()];return n===void 0?console.warn(`THREE.Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ot(e.r),this.g=Ot(e.g),this.b=Ot(e.b),this}copyLinearToSRGB(e){return this.r=kt(e.r),this.g=kt(e.g),this.b=kt(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Me){return Dt.workingToColorSpace(sr.copy(this),e),Math.round(H(sr.r*255,0,255))*65536+Math.round(H(sr.g*255,0,255))*256+Math.round(H(sr.b*255,0,255))}getHexString(e=Me){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Dt.workingColorSpace){Dt.workingToColorSpace(sr.copy(this),t);let n=sr.r,r=sr.g,i=sr.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=Dt.workingColorSpace){return Dt.workingToColorSpace(sr.copy(this),t),e.r=sr.r,e.g=sr.g,e.b=sr.b,e}getStyle(e=Me){Dt.workingToColorSpace(sr.copy(this),e);let t=sr.r,n=sr.g,r=sr.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(ir),this.setHSL(ir.h+e,ir.s+t,ir.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ir),e.getHSL(ar);let n=Xe(ir.h,ar.h,t),r=Xe(ir.s,ar.s,t),i=Xe(ir.l,ar.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},sr=new J;J.NAMES=rr;var cr=0,lr=class extends Ve{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:cr++}),this.uuid=Ke(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new J(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ie,this.stencilZFail=Ie,this.stencilZPass=Ie,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,this.name!==``&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==0&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==204&&(n.blendSrc=this.blendSrc),this.blendDst!==205&&(n.blendDst=this.blendDst),this.blendEquation!==100&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(n.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==`round`&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==`round`&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},ur=class extends lr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new J(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Tn,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},dr=fr();function fr(){let e=new ArrayBuffer(4),t=new Float32Array(e),n=new Uint32Array(e),r=new Uint32Array(512),i=new Uint32Array(512);for(let e=0;e<256;++e){let t=e-127;t<-27?(r[e]=0,r[e|256]=32768,i[e]=24,i[e|256]=24):t<-14?(r[e]=1024>>-t-14,r[e|256]=1024>>-t-14|32768,i[e]=-t-1,i[e|256]=-t-1):t<=15?(r[e]=t+15<<10,r[e|256]=t+15<<10|32768,i[e]=13,i[e|256]=13):t<128?(r[e]=31744,r[e|256]=64512,i[e]=24,i[e|256]=24):(r[e]=31744,r[e|256]=64512,i[e]=13,i[e|256]=13)}let a=new Uint32Array(2048),o=new Uint32Array(64),s=new Uint32Array(64);for(let e=1;e<1024;++e){let t=e<<13,n=0;for(;!(t&8388608);)t<<=1,n-=8388608;t&=-8388609,n+=947912704,a[e]=t|n}for(let e=1024;e<2048;++e)a[e]=939524096+(e-1024<<13);for(let e=1;e<31;++e)o[e]=e<<23;o[31]=1199570944,o[32]=2147483648;for(let e=33;e<63;++e)o[e]=2147483648+(e-32<<23);o[63]=3347054592;for(let e=1;e<64;++e)e!==32&&(s[e]=1024);return{floatView:t,uint32View:n,baseTable:r,shiftTable:i,mantissaTable:a,exponentTable:o,offsetTable:s}}function pr(e){Math.abs(e)>65504&&console.warn(`THREE.DataUtils.toHalfFloat(): Value out of range.`),e=H(e,-65504,65504),dr.floatView[0]=e;let t=dr.uint32View[0],n=t>>23&511;return dr.baseTable[n]+((t&8388607)>>dr.shiftTable[n])}function mr(e){let t=e>>10;return dr.uint32View[0]=dr.mantissaTable[dr.offsetTable[t]+(e&1023)]+dr.exponentTable[t],dr.floatView[0]}var hr=class{static toHalfFloat(e){return pr(e)}static fromHalfFloat(e){return mr(e)}},gr=new W,_r=new U,vr=0,yr=class{constructor(e,t,n=!1){if(Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:vr++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=Le,this.updateRanges=[],this.gpuType=g,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)_r.fromBufferAttribute(this,t),_r.applyMatrix3(e),this.setXY(t,_r.x,_r.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)gr.fromBufferAttribute(this,t),gr.applyMatrix3(e),this.setXYZ(t,gr.x,gr.y,gr.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)gr.fromBufferAttribute(this,t),gr.applyMatrix4(e),this.setXYZ(t,gr.x,gr.y,gr.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)gr.fromBufferAttribute(this,t),gr.applyNormalMatrix(e),this.setXYZ(t,gr.x,gr.y,gr.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)gr.fromBufferAttribute(this,t),gr.transformDirection(e),this.setXYZ(t,gr.x,gr.y,gr.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=dt(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ft(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=dt(t,this.array)),t}setX(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=dt(t,this.array)),t}setY(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=dt(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=dt(t,this.array)),t}setW(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),r=ft(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),r=ft(r,this.array),i=ft(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==``&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}},br=class extends yr{constructor(e,t,n){super(new Uint16Array(e),t,n)}},xr=class extends yr{constructor(e,t,n){super(new Uint32Array(e),t,n)}},Sr=class extends yr{constructor(e,t,n){super(new Float32Array(e),t,n)}},Cr=0,wr=new q,Tr=new Hn,Er=new W,Dr=new Ht,Or=new Ht,kr=new W,Ar=class e extends Ve{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Cr++}),this.uuid=Ke(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(vt(e)?xr:br)(e,1):e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new G().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return wr.makeRotationFromQuaternion(e),this.applyMatrix4(wr),this}rotateX(e){return wr.makeRotationX(e),this.applyMatrix4(wr),this}rotateY(e){return wr.makeRotationY(e),this.applyMatrix4(wr),this}rotateZ(e){return wr.makeRotationZ(e),this.applyMatrix4(wr),this}translate(e,t,n){return wr.makeTranslation(e,t,n),this.applyMatrix4(wr),this}scale(e,t,n){return wr.makeScale(e,t,n),this.applyMatrix4(wr),this}lookAt(e){return Tr.lookAt(e),Tr.updateMatrix(),this.applyMatrix4(Tr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Er).negate(),this.translate(Er.x,Er.y,Er.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new Sr(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&console.warn(`THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ht);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error(`THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new W(-1/0,-1/0,-1/0),new W(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Dr.setFromBufferAttribute(n),this.morphTargetsRelative?(kr.addVectors(this.boundingBox.min,Dr.min),this.boundingBox.expandByPoint(kr),kr.addVectors(this.boundingBox.max,Dr.max),this.boundingBox.expandByPoint(kr)):(this.boundingBox.expandByPoint(Dr.min),this.boundingBox.expandByPoint(Dr.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error(`THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new sn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error(`THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new W,1/0);return}if(e){let n=this.boundingSphere.center;if(Dr.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Or.setFromBufferAttribute(n),this.morphTargetsRelative?(kr.addVectors(Dr.min,Or.min),Dr.expandByPoint(kr),kr.addVectors(Dr.max,Or.max),Dr.expandByPoint(kr)):(Dr.expandByPoint(Or.min),Dr.expandByPoint(Or.max))}Dr.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)kr.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(kr));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)kr.fromBufferAttribute(a,t),o&&(Er.fromBufferAttribute(e,t),kr.add(Er)),r=Math.max(r,n.distanceToSquared(kr))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error(`THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error(`THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv;this.hasAttribute(`tangent`)===!1&&this.setAttribute(`tangent`,new yr(new Float32Array(4*n.count),4));let a=this.getAttribute(`tangent`),o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new W,s[e]=new W;let c=new W,l=new W,u=new W,d=new U,f=new U,p=new U,m=new W,h=new W;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new W,y=new W,b=new W,x=new W;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0)n=new yr(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new W,i=new W,a=new W,o=new W,s=new W,c=new W,l=new W,u=new W;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)kr.fromBufferAttribute(e,t),kr.normalize(),e.setXYZ(t,kr.x,kr.y,kr.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new yr(a,r,i)}if(this.index===null)return console.warn(`THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.type,this.name!==``&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:`dispose`})}},jr=new q,Mr=new hn,Nr=new sn,Pr=new W,Fr=new W,Ir=new W,Lr=new W,Rr=new W,zr=new W,Br=new W,Vr=new W,Hr=class extends Hn{constructor(e=new Ar,t=new ur){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){zr.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Rr.fromBufferAttribute(s,e),a?zr.addScaledVector(Rr,r):zr.addScaledVector(Rr.sub(t),r))}t.add(zr)}return t}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Nr.copy(n.boundingSphere),Nr.applyMatrix4(i),Mr.copy(e.ray).recast(e.near),!(Nr.containsPoint(Mr.origin)===!1&&(Mr.intersectSphere(Nr,Pr)===null||Mr.origin.distanceToSquared(Pr)>(e.far-e.near)**2))&&(jr.copy(i).invert(),Mr.copy(e.ray).applyMatrix4(jr),(n.boundingBox===null||Mr.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,Mr)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=Wr(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=Wr(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=Wr(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=Wr(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function Ur(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;Vr.copy(s),Vr.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(Vr);return l<n.near||l>n.far?null:{distance:l,point:Vr.clone(),object:e}}function Wr(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Fr),e.getVertexPosition(c,Ir),e.getVertexPosition(l,Lr);let u=Ur(e,t,n,r,Fr,Ir,Lr,Br);if(u){let e=new W;nr.getBarycoord(Br,Fr,Ir,Lr,e),i&&(u.uv=nr.getInterpolatedAttribute(i,s,c,l,e,new U)),a&&(u.uv1=nr.getInterpolatedAttribute(a,s,c,l,e,new U)),o&&(u.normal=nr.getInterpolatedAttribute(o,s,c,l,e,new W),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new W,materialIndex:0};nr.getNormal(Fr,Ir,Lr,t.normal),u.face=t,u.barycoord=e}return u}var Gr=class e extends Ar{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new Sr(c,3)),this.setAttribute(`normal`,new Sr(l,3)),this.setAttribute(`uv`,new Sr(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new W;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function Kr(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone():Array.isArray(i)?t[n][r]=i.slice():t[n][r]=i}}return t}function qr(e){let t={};for(let n=0;n<e.length;n++){let r=Kr(e[n]);for(let e in r)t[e]=r[e]}return t}function Jr(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function Yr(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Dt.workingColorSpace}var Xr={clone:Kr,merge:qr},Zr=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Qr=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,$r=class extends lr{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Zr,this.fragmentShader=Qr,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Kr(e.uniforms),this.uniformsGroups=Jr(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},ei=class extends Hn{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new q,this.projectionMatrix=new q,this.projectionMatrixInverse=new q,this.coordinateSystem=Be,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},ti=new W,ni=new U,ri=new U,ii=class extends ei{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Ge*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(We*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ge*2*Math.atan(Math.tan(We*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ti.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ti.x,ti.y).multiplyScalar(-e/ti.z),ti.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ti.x,ti.y).multiplyScalar(-e/ti.z)}getViewSize(e,t){return this.getViewBounds(e,ni,ri),t.subVectors(ri,ni)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(We*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},ai=-90,oi=1,si=class extends Hn{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new ii(ai,oi,e,t);r.layers=this.layers,this.add(r);let i=new ii(ai,oi,e,t);i.layers=this.layers,this.add(i);let a=new ii(ai,oi,e,t);a.layers=this.layers,this.add(a);let o=new ii(ai,oi,e,t);o.layers=this.layers,this.add(o);let s=new ii(ai,oi,e,t);s.layers=this.layers,this.add(s);let c=new ii(ai,oi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,i),e.setRenderTarget(n,1,r),e.render(t,a),e.setRenderTarget(n,2,r),e.render(t,o),e.setRenderTarget(n,3,r),e.render(t,s),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},ci=class extends Lt{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},li=class extends zt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new ci(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new Gr(5,5,5),i=new $r({name:`CubemapFromEquirect`,uniforms:Kr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new Hr(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=s),new si(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},ui=class extends Hn{constructor(){super(),this.isGroup=!0,this.type=`Group`}},di={type:`move`},fi=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ui,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ui,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new W,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new W),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ui,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new W,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new W),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(di)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new ui;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},pi=class extends Hn{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Tn,this.environmentIntensity=1,this.environmentRotation=new Tn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},mi=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e===void 0?0:e.length/t,this.usage=Le,this.updateRanges=[],this.version=0,this.uuid=Ke()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,i=this.stride;r<i;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ke()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ke()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},hi=new W,gi=class e{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name=``,this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)hi.fromBufferAttribute(this,t),hi.applyMatrix4(e),this.setXYZ(t,hi.x,hi.y,hi.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)hi.fromBufferAttribute(this,t),hi.applyNormalMatrix(e),this.setXYZ(t,hi.x,hi.y,hi.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)hi.fromBufferAttribute(this,t),hi.transformDirection(e),this.setXYZ(t,hi.x,hi.y,hi.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=dt(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ft(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=dt(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=dt(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=dt(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=dt(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),r=ft(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),r=ft(r,this.array),i=ft(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=i,this}clone(t){if(t===void 0){console.log(`THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return new yr(new this.array.constructor(e),this.itemSize,this.normalized)}return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new e(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log(`THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},_i=new W,vi=new K,yi=new K,bi=new W,xi=new q,Si=new W,Ci=new sn,wi=new q,Ti=new hn,Ei=class extends Hr{constructor(t,n){super(t,n),this.isSkinnedMesh=!0,this.type=`SkinnedMesh`,this.bindMode=e,this.bindMatrix=new q,this.bindMatrixInverse=new q,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Ht),this.boundingBox.makeEmpty();let t=e.getAttribute(`position`);for(let e=0;e<t.count;e++)this.getVertexPosition(e,Si),this.boundingBox.expandByPoint(Si)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new sn),this.boundingSphere.makeEmpty();let t=e.getAttribute(`position`);for(let e=0;e<t.count;e++)this.getVertexPosition(e,Si),this.boundingSphere.expandByPoint(Si)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,r=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ci.copy(this.boundingSphere),Ci.applyMatrix4(r),e.ray.intersectsSphere(Ci)!==!1&&(wi.copy(r).invert(),Ti.copy(e.ray).applyMatrix4(wi),(this.boundingBox===null||Ti.intersectsBox(this.boundingBox)!==!1)&&this._computeIntersections(e,t,Ti)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new K,t=this.geometry.attributes.skinWeight;for(let n=0,r=t.count;n<r;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r===1/0?e.set(1,0,0,0):e.multiplyScalar(r),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===`attached`?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===`detached`?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn(`THREE.SkinnedMesh: Unrecognized bindMode: `+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,r=this.geometry;vi.fromBufferAttribute(r.attributes.skinIndex,e),yi.fromBufferAttribute(r.attributes.skinWeight,e),_i.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let e=0;e<4;e++){let r=yi.getComponent(e);if(r!==0){let i=vi.getComponent(e);xi.multiplyMatrices(n.bones[i].matrixWorld,n.boneInverses[i]),t.addScaledVector(bi.copy(_i).applyMatrix4(xi),r)}}return t.applyMatrix4(this.bindMatrixInverse)}},Di=class extends Hn{constructor(){super(),this.isBone=!0,this.type=`Bone`}},Oi=class extends Lt{constructor(e=null,t=1,n=1,r,a,o,s,c,l=i,u=i,d,f){super(null,o,s,c,l,u,r,a,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},ki=new q,Ai=new q,ji=class e{constructor(e=[],t=[]){this.uuid=Ke(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn(`THREE.Skeleton: Number of inverse bone matrices does not match amount of bones.`),this.boneInverses=[];for(let e=0,t=this.bones.length;e<t;e++)this.boneInverses.push(new q)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let t=new q;this.bones[e]&&t.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(t)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let t=this.bones[e];t&&t.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let t=this.bones[e];t&&(t.parent&&t.parent.isBone?(t.matrix.copy(t.parent.matrixWorld).invert(),t.matrix.multiply(t.matrixWorld)):t.matrix.copy(t.matrixWorld),t.matrix.decompose(t.position,t.quaternion,t.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,r=this.boneTexture;for(let r=0,i=e.length;r<i;r++){let i=e[r]?e[r].matrixWorld:Ai;ki.multiplyMatrices(i,t[r]),ki.toArray(n,r*16)}r!==null&&(r.needsUpdate=!0)}clone(){return new e(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new Oi(t,e,e,T,g);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let n=this.bones[t];if(n.name===e)return n}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,r=e.bones.length;n<r;n++){let r=e.bones[n],i=t[r];i===void 0&&(console.warn(`THREE.Skeleton: No bone found with UUID:`,r),i=new Di),this.bones.push(i),this.boneInverses.push(new q().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:`Skeleton`,generator:`Skeleton.toJSON`},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let r=0,i=t.length;r<i;r++){let i=t[r];e.bones.push(i.uuid);let a=n[r];e.boneInverses.push(a.toArray())}return e}},Mi=class extends yr{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Ni=new q,Pi=new q,Fi=[],Ii=new Ht,Li=new q,Ri=new Hr,zi=new sn,Bi=class extends Hr{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Mi(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,Li)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Ht),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ni),Ii.copy(e.boundingBox).applyMatrix4(Ni),this.boundingBox.union(Ii)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new sn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ni),zi.copy(e.boundingSphere).applyMatrix4(Ni),this.boundingSphere.union(zi)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(Ri.geometry=this.geometry,Ri.material=this.material,Ri.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),zi.copy(this.boundingSphere),zi.applyMatrix4(n),e.ray.intersectsSphere(zi)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,Ni),Pi.multiplyMatrices(n,Ni),Ri.matrixWorld=Pi,Ri.raycast(e,Fi);for(let e=0,n=Fi.length;e<n;e++){let n=Fi[e];n.instanceId=i,n.object=this,t.push(n)}Fi.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Mi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new Oi(new Float32Array(r*this.count),r,this.count,ee,g));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;i[s]=o,i.set(n,s+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:`dispose`}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Vi=new W,Hi=new W,Ui=new G,Wi=class{constructor(e=new W(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Vi.subVectors(n,t).cross(Hi.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Vi),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let i=-(e.start.dot(this.normal)+this.constant)/r;return i<0||i>1?null:t.copy(e.start).addScaledVector(n,i)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Ui.getNormalMatrix(e),r=this.coplanarPoint(Vi).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Gi=new sn,Ki=new U(.5,.5),qi=new W,Ji=class{constructor(e=new Wi,t=new Wi,n=new Wi,r=new Wi,i=new Wi,a=new Wi){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Be,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Gi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Gi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Gi)}intersectsSprite(e){return Gi.center.set(0,0,0),Gi.radius=.7071067811865476+Ki.distanceTo(e.center),Gi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Gi)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(qi.x=r.normal.x>0?e.max.x:e.min.x,qi.y=r.normal.y>0?e.max.y:e.min.y,qi.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(qi)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Yi=class extends lr{constructor(e){super(),this.isLineBasicMaterial=!0,this.type=`LineBasicMaterial`,this.color=new J(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Xi=new W,Zi=new W,Qi=new q,$i=new hn,ea=new sn,ta=new W,na=new W,ra=class extends Hn{constructor(e=new Ar,t=new Yi){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)Xi.fromBufferAttribute(t,e-1),Zi.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=Xi.distanceTo(Zi);e.setAttribute(`lineDistance`,new Sr(n,1))}else console.warn(`THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ea.copy(n.boundingSphere),ea.applyMatrix4(r),ea.radius+=i,e.ray.intersectsSphere(ea)===!1)return;Qi.copy(r).invert(),$i.copy(e.ray).applyMatrix4(Qi);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){let n=Math.max(0,a.start),r=Math.min(l.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=l.getX(i),r=l.getX(i+1),a=ia(this,e,$i,s,n,r,i);a&&t.push(a)}if(this.isLineLoop){let i=l.getX(r-1),a=l.getX(n),o=ia(this,e,$i,s,i,a,r-1);o&&t.push(o)}}else{let n=Math.max(0,a.start),r=Math.min(u.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=ia(this,e,$i,s,i,i+1,i);n&&t.push(n)}if(this.isLineLoop){let i=ia(this,e,$i,s,r-1,n,r-1);i&&t.push(i)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function ia(e,t,n,r,i,a,o){let s=e.geometry.attributes.position;if(Xi.fromBufferAttribute(s,i),Zi.fromBufferAttribute(s,a),n.distanceSqToSegment(Xi,Zi,ta,na)>r)return;ta.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(ta);if(!(c<t.near||c>t.far))return{distance:c,point:na.clone().applyMatrix4(e.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:e}}var aa=new W,oa=new W,sa=class extends ra{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type=`LineSegments`}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let e=0,r=t.count;e<r;e+=2)aa.fromBufferAttribute(t,e),oa.fromBufferAttribute(t,e+1),n[e]=e===0?0:n[e-1],n[e+1]=n[e]+aa.distanceTo(oa);e.setAttribute(`lineDistance`,new Sr(n,1))}else console.warn(`THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}},ca=class extends ra{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type=`LineLoop`}},la=class extends lr{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new J(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},ua=new q,da=new hn,fa=new sn,pa=new W,ma=class extends Hn{constructor(e=new Ar,t=new la){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),fa.copy(n.boundingSphere),fa.applyMatrix4(r),fa.radius+=i,e.ray.intersectsSphere(fa)===!1)return;ua.copy(r).invert(),da.copy(e.ray).applyMatrix4(ua);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);pa.fromBufferAttribute(l,n),ha(pa,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)pa.fromBufferAttribute(l,a),ha(pa,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function ha(e,t,n,r,i,a,o){let s=da.distanceSqToPoint(e);if(s<n){let n=new W;da.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var ga=class extends Lt{constructor(e,t,n=h,r,a,o,s=i,c=i,l,u=E,d=1){if(u!==1026&&u!==1027)throw Error(`DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:d},r,a,o,s,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Nt(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},_a=class extends Lt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},va=class e extends Ar{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new Sr(u,3)),this.setAttribute(`normal`,new Sr(d,3)),this.setAttribute(`uv`,new Sr(f,2));function _(){let a=new W,_=new W,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new U,m=new W,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},ya=class e extends va{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},ba=class e extends Ar{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new Sr(i,3)),this.setAttribute(`normal`,new Sr(i.slice(),3)),this.setAttribute(`uv`,new Sr(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new W,r=new W,i=new W;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new W;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new W;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new W,t=new W,n=new W,r=new W,o=new U,s=new U,c=new U;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.details)}},xa=class e extends ba{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Sa=class e extends Ar{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new Sr(p,3)),this.setAttribute(`normal`,new Sr(m,3)),this.setAttribute(`uv`,new Sr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},Ca=class extends lr{constructor(e){super(),this.isShadowMaterial=!0,this.type=`ShadowMaterial`,this.color=new J(0),this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.fog=e.fog,this}},wa=class extends lr{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new J(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new J(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new U(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Tn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Ta=class extends wa{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:``,PHYSICAL:``},this.type=`MeshPhysicalMaterial`,this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new U(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return H(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new J(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new J(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new J(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:``,PHYSICAL:``},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}},Ea=class extends lr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=Ae,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Da=class extends lr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Oa(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function ka(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function Aa(e){function t(t,n){return e[t]-e[n]}let n=e.length,r=Array(n);for(let e=0;e!==n;++e)r[e]=e;return r.sort(t),r}function ja(e,t,n){let r=e.length,i=new e.constructor(r);for(let a=0,o=0;o!==r;++a){let r=n[a]*t;for(let n=0;n!==t;++n)i[o++]=e[r+n]}return i}function Ma(e,t,n,r){let i=1,a=e[0];for(;a!==void 0&&a[r]===void 0;)a=e[i++];if(a===void 0)return;let o=a[r];if(o!==void 0){if(Array.isArray(o))do o=a[r],o!==void 0&&(t.push(a.time),n.push(...o)),a=e[i++];while(a!==void 0);else if(o.toArray!==void 0)do o=a[r],o!==void 0&&(t.push(a.time),o.toArray(n,n.length)),a=e[i++];while(a!==void 0);else do o=a[r],o!==void 0&&(t.push(a.time),n.push(o)),a=e[i++];while(a!==void 0)}}var Na=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`call to abstract method`)}intervalChanged_(){}},Pa=class extends Na{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ee,endingEnd:Ee}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case De:i=e,o=2*t-n;break;case Oe:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case De:a=e,s=2*n-t;break;case Oe:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},Fa=class extends Na{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},Ia=class extends Na{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},La=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Oa(t,this.TimeBufferType),this.values=Oa(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Oa(e.times,Array),values:Oa(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Ia(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Fa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Pa(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Ce:t=this.InterpolantFactoryMethodDiscrete;break;case we:t=this.InterpolantFactoryMethodLinear;break;case Te:t=this.InterpolantFactoryMethodSmooth}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return console.warn(`THREE.KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ce;case this.InterpolantFactoryMethodLinear:return we;case this.InterpolantFactoryMethodSmooth:return Te}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error(`THREE.KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(console.error(`THREE.KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){console.error(`THREE.KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){console.error(`THREE.KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&ka(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){console.error(`THREE.KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===Te,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};La.prototype.ValueTypeName=``,La.prototype.TimeBufferType=Float32Array,La.prototype.ValueBufferType=Float32Array,La.prototype.DefaultInterpolation=we;var Ra=class extends La{constructor(e,t,n){super(e,t,n)}};Ra.prototype.ValueTypeName=`bool`,Ra.prototype.ValueBufferType=Array,Ra.prototype.DefaultInterpolation=Ce,Ra.prototype.InterpolantFactoryMethodLinear=void 0,Ra.prototype.InterpolantFactoryMethodSmooth=void 0;var za=class extends La{constructor(e,t,n,r){super(e,t,n,r)}};za.prototype.ValueTypeName=`color`;var Ba=class extends La{constructor(e,t,n,r){super(e,t,n,r)}};Ba.prototype.ValueTypeName=`number`;var Va=class extends Na{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)mt.slerpFlat(i,0,a,c-o,a,c,s);return i}},Ha=class extends La{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new Va(this.times,this.values,this.getValueSize(),e)}};Ha.prototype.ValueTypeName=`quaternion`,Ha.prototype.InterpolantFactoryMethodSmooth=void 0;var Ua=class extends La{constructor(e,t,n){super(e,t,n)}};Ua.prototype.ValueTypeName=`string`,Ua.prototype.ValueBufferType=Array,Ua.prototype.DefaultInterpolation=Ce,Ua.prototype.InterpolantFactoryMethodLinear=void 0,Ua.prototype.InterpolantFactoryMethodSmooth=void 0;var Wa=class extends La{constructor(e,t,n,r){super(e,t,n,r)}};Wa.prototype.ValueTypeName=`vector`;var Ga=class{constructor(e=``,t=-1,n=[],r=ke){this.name=e,this.tracks=n,this.duration=t,this.blendMode=r,this.uuid=Ke(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,r=1/(e.fps||1);for(let e=0,i=n.length;e!==i;++e)t.push(qa(n[e]).scale(r));let i=new this(e.name,e.duration,t,e.blendMode);return i.uuid=e.uuid,i.userData=JSON.parse(e.userData||`{}`),i}static toJSON(e){let t=[],n=e.tracks,r={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let e=0,r=n.length;e!==r;++e)t.push(La.toJSON(n[e]));return r}static CreateFromMorphTargetSequence(e,t,n,r){let i=t.length,a=[];for(let e=0;e<i;e++){let o=[],s=[];o.push((e+i-1)%i,e,(e+1)%i),s.push(0,1,0);let c=Aa(o);o=ja(o,1,c),s=ja(s,1,c),!r&&o[0]===0&&(o.push(i),s.push(s[0])),a.push(new Ba(`.morphTargetInfluences[`+t[e].name+`]`,o,s).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let t=e;n=t.geometry&&t.geometry.animations||t.animations}for(let e=0;e<n.length;e++)if(n[e].name===t)return n[e];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let r={},i=/^([\w-]*?)([\d]+)$/;for(let t=0,n=e.length;t<n;t++){let n=e[t],a=n.name.match(i);if(a&&a.length>1){let e=a[1],t=r[e];t||(r[e]=t=[]),t.push(n)}}let a=[];for(let e in r)a.push(this.CreateFromMorphTargetSequence(e,r[e],t,n));return a}static parseAnimation(e,t){if(console.warn(`THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185`),!e)return console.error(`THREE.AnimationClip: No animation in JSONLoader data.`),null;let n=function(e,t,n,r,i){if(n.length!==0){let a=[],o=[];Ma(n,a,o,r),a.length!==0&&i.push(new e(t,a,o))}},r=[],i=e.name||`default`,a=e.fps||30,o=e.blendMode,s=e.length||-1,c=e.hierarchy||[];for(let e=0;e<c.length;e++){let i=c[e].keys;if(i&&i.length!==0){if(i[0].morphTargets){let e={},t=0;for(;t<i.length;t++)if(i[t].morphTargets)for(let n=0;n<i[t].morphTargets.length;n++)e[i[t].morphTargets[n]]=-1;for(let n in e){let e=[],a=[];for(let r=0;r!==i[t].morphTargets.length;++r){let r=i[t];e.push(r.time),a.push(+(r.morphTarget===n))}r.push(new Ba(`.morphTargetInfluence[`+n+`]`,e,a))}s=e.length*a}else{let a=`.bones[`+t[e].name+`]`;n(Wa,a+`.position`,i,`pos`,r),n(Ha,a+`.quaternion`,i,`rot`,r),n(Wa,a+`.scale`,i,`scl`,r)}}}return r.length===0?null:new this(i,s,r,o)}resetDuration(){let e=this.tracks,t=0;for(let n=0,r=e.length;n!==r;++n){let e=this.tracks[n];t=Math.max(t,e.times[e.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e&&=this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function Ka(e){switch(e.toLowerCase()){case`scalar`:case`double`:case`float`:case`number`:case`integer`:return Ba;case`vector`:case`vector2`:case`vector3`:case`vector4`:return Wa;case`color`:return za;case`quaternion`:return Ha;case`bool`:case`boolean`:return Ra;case`string`:return Ua}throw Error(`THREE.KeyframeTrack: Unsupported typeName: `+e)}function qa(e){if(e.type===void 0)throw Error(`THREE.KeyframeTrack: track type undefined, can not parse`);let t=Ka(e.type);if(e.times===void 0){let t=[],n=[];Ma(e.keys,t,n,`value`),e.times=t,e.values=n}return t.parse===void 0?new t(e.name,e.times,e.values,e.interpolation):t.parse(e)}var Ja={enabled:!1,files:{},add:function(e,t){this.enabled!==!1&&(this.files[e]=t)},get:function(e){if(this.enabled!==!1)return this.files[e]},remove:function(e){delete this.files[e]},clear:function(){this.files={}}},Ya=new class{constructor(e,t,n){let r=this,i=!1,a=0,o=0,s,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(e){o++,i===!1&&r.onStart!==void 0&&r.onStart(e,a,o),i=!0},this.itemEnd=function(e){a++,r.onProgress!==void 0&&r.onProgress(e,a,o),a===o&&(i=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(e){r.onError!==void 0&&r.onError(e)},this.resolveURL=function(e){return s?s(e):e},this.setURLModifier=function(e){return s=e,this},this.addHandler=function(e,t){return c.push(e,t),this},this.removeHandler=function(e){let t=c.indexOf(e);return t!==-1&&c.splice(t,2),this},this.getHandler=function(e){for(let t=0,n=c.length;t<n;t+=2){let n=c[t],r=c[t+1];if(n.global&&(n.lastIndex=0),n.test(e))return r}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},Xa=class{constructor(e){this.manager=e===void 0?Ya:e,this.crossOrigin=`anonymous`,this.withCredentials=!1,this.path=``,this.resourcePath=``,this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,i){n.load(e,r,t,i)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Xa.DEFAULT_MATERIAL_NAME=`__DEFAULT`;var Za={},Qa=class extends Error{constructor(e,t){super(e),this.response=t}},$a=class extends Xa{constructor(e){super(e),this.mimeType=``,this.responseType=``,this._abortController=new AbortController}load(e,t,n,r){e===void 0&&(e=``),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=Ja.get(`file:${e}`);if(i!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(i),this.manager.itemEnd(e)},0),i;if(Za[e]!==void 0){Za[e].push({onLoad:t,onProgress:n,onError:r});return}Za[e]=[],Za[e].push({onLoad:t,onProgress:n,onError:r});let a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?`include`:`same-origin`,signal:typeof AbortSignal.any==`function`?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,s=this.responseType;fetch(a).then(t=>{if(t.status===200||t.status===0){if(t.status===0&&console.warn(`THREE.FileLoader: HTTP Status 0 received.`),typeof ReadableStream>`u`||t.body===void 0||t.body.getReader===void 0)return t;let n=Za[e],r=t.body.getReader(),i=t.headers.get(`X-File-Size`)||t.headers.get(`Content-Length`),a=i?parseInt(i):0,o=a!==0,s=0,c=new ReadableStream({start(e){t();function t(){r.read().then(({done:r,value:i})=>{if(r)e.close();else{s+=i.byteLength;let r=new ProgressEvent(`progress`,{lengthComputable:o,loaded:s,total:a});for(let e=0,t=n.length;e<t;e++){let t=n[e];t.onProgress&&t.onProgress(r)}e.enqueue(i),t()}},t=>{e.error(t)})}}});return new Response(c)}throw new Qa(`fetch for "${t.url}" responded with ${t.status}: ${t.statusText}`,t)}).then(e=>{switch(s){case`arraybuffer`:return e.arrayBuffer();case`blob`:return e.blob();case`document`:return e.text().then(e=>new DOMParser().parseFromString(e,o));case`json`:return e.json();default:if(o===``)return e.text();{let t=/charset="?([^;"\s]*)"?/i.exec(o),n=t&&t[1]?t[1].toLowerCase():void 0,r=new TextDecoder(n);return e.arrayBuffer().then(e=>r.decode(e))}}}).then(t=>{Ja.add(`file:${e}`,t);let n=Za[e];delete Za[e];for(let e=0,r=n.length;e<r;e++){let r=n[e];r.onLoad&&r.onLoad(t)}}).catch(t=>{let n=Za[e];if(n===void 0)throw this.manager.itemError(e),t;delete Za[e];for(let e=0,r=n.length;e<r;e++){let r=n[e];r.onError&&r.onError(t)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}},eo=new WeakMap,to=class extends Xa{constructor(e){super(e)}load(e,t,n,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=this,a=Ja.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)i.manager.itemStart(e),setTimeout(function(){t&&t(a),i.manager.itemEnd(e)},0);else{let e=eo.get(a);e===void 0&&(e=[],eo.set(a,e)),e.push({onLoad:t,onError:r})}return a}let o=yt(`img`);function s(){l(),t&&t(this);let n=eo.get(this)||[];for(let e=0;e<n.length;e++){let t=n[e];t.onLoad&&t.onLoad(this)}eo.delete(this),i.manager.itemEnd(e)}function c(t){l(),r&&r(t),Ja.remove(`image:${e}`);let n=eo.get(this)||[];for(let e=0;e<n.length;e++){let r=n[e];r.onError&&r.onError(t)}eo.delete(this),i.manager.itemError(e),i.manager.itemEnd(e)}function l(){o.removeEventListener(`load`,s,!1),o.removeEventListener(`error`,c,!1)}return o.addEventListener(`load`,s,!1),o.addEventListener(`error`,c,!1),e.slice(0,5)!==`data:`&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),Ja.add(`image:${e}`,o),i.manager.itemStart(e),o.src=e,o}},no=class extends Xa{constructor(e){super(e)}load(e,t,n,r){let i=new Lt,a=new to(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(e){i.image=e,i.needsUpdate=!0,t!==void 0&&t(i)},n,r),i}},ro=class extends Hn{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new J(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},io=new q,ao=new W,oo=new W,so=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new U(512,512),this.mapType=u,this.map=null,this.mapPass=null,this.matrix=new q,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ji,this._frameExtents=new U(1,1),this._viewportCount=1,this._viewports=[new K(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;ao.setFromMatrixPosition(e.matrixWorld),t.position.copy(ao),oo.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(oo),t.updateMatrixWorld(),io.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(io,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(io)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},co=class extends so{constructor(){super(new ii(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=Ge*2*e.angle*this.focus,r=this.mapSize.width/this.mapSize.height*this.aspect,i=e.distance||t.far;(n!==t.fov||r!==t.aspect||i!==t.far)&&(t.fov=n,t.aspect=r,t.far=i,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},lo=class extends ro{constructor(e,t,n=0,r=Math.PI/3,i=0,a=2){super(e,t),this.isSpotLight=!0,this.type=`SpotLight`,this.position.copy(Hn.DEFAULT_UP),this.updateMatrix(),this.target=new Hn,this.distance=n,this.angle=r,this.penumbra=i,this.decay=a,this.map=null,this.shadow=new co}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},uo=new q,fo=new W,po=new W,mo=class extends so{constructor(){super(new ii(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new U(4,2),this._viewportCount=6,this._viewports=[new K(2,1,1,1),new K(0,1,1,1),new K(3,1,1,1),new K(1,1,1,1),new K(3,0,1,1),new K(1,0,1,1)],this._cubeDirections=[new W(1,0,0),new W(-1,0,0),new W(0,0,1),new W(0,0,-1),new W(0,1,0),new W(0,-1,0)],this._cubeUps=[new W(0,1,0),new W(0,1,0),new W(0,1,0),new W(0,1,0),new W(0,0,1),new W(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,r=this.matrix,i=e.distance||n.far;i!==n.far&&(n.far=i,n.updateProjectionMatrix()),fo.setFromMatrixPosition(e.matrixWorld),n.position.copy(fo),po.copy(n.position),po.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(po),n.updateMatrixWorld(),r.makeTranslation(-fo.x,-fo.y,-fo.z),uo.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(uo,n.coordinateSystem,n.reversedDepth)}},ho=class extends ro{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type=`PointLight`,this.distance=n,this.decay=r,this.shadow=new mo}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},go=class extends ei{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},_o=class extends so{constructor(){super(new go(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},vo=class extends ro{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(Hn.DEFAULT_UP),this.updateMatrix(),this.target=new Hn,this.shadow=new _o}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},yo=class{static extractUrlBase(e){let t=e.lastIndexOf(`/`);return t===-1?`./`:e.slice(0,t+1)}static resolveURL(e,t){return typeof e!=`string`||e===``?``:(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,`$1`)),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}},bo=new WeakMap,xo=class extends Xa{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>`u`&&console.warn(`THREE.ImageBitmapLoader: createImageBitmap() not supported.`),typeof fetch>`u`&&console.warn(`THREE.ImageBitmapLoader: fetch() not supported.`),this.options={premultiplyAlpha:`none`},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,r){e===void 0&&(e=``),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=this,a=Ja.get(`image-bitmap:${e}`);if(a!==void 0){if(i.manager.itemStart(e),a.then){a.then(n=>{if(bo.has(a)===!0)r&&r(bo.get(a)),i.manager.itemError(e),i.manager.itemEnd(e);else return t&&t(n),i.manager.itemEnd(e),n});return}return setTimeout(function(){t&&t(a),i.manager.itemEnd(e)},0),a}let o={};o.credentials=this.crossOrigin===`anonymous`?`same-origin`:`include`,o.headers=this.requestHeader,o.signal=typeof AbortSignal.any==`function`?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let s=fetch(e,o).then(function(e){return e.blob()}).then(function(e){return createImageBitmap(e,Object.assign(i.options,{colorSpaceConversion:`none`}))}).then(function(n){return Ja.add(`image-bitmap:${e}`,n),t&&t(n),i.manager.itemEnd(e),n}).catch(function(t){r&&r(t),bo.set(s,t),Ja.remove(`image-bitmap:${e}`),i.manager.itemError(e),i.manager.itemEnd(e)});Ja.add(`image-bitmap:${e}`,s),i.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}},So=class extends ii{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Co=`\\[\\]\\.:\\/`,wo=RegExp(`[\\[\\]\\.:\\/]`,`g`),To=`[^\\[\\]\\.:\\/]`,Eo=`[^`+Co.replace(`\\.`,``)+`]`,Do=`((?:WC+[\\/:])*)`.replace(`WC`,To),Oo=`(WCOD+)?`.replace(`WCOD`,Eo),ko=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,To),Ao=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,To),jo=RegExp(`^`+Do+Oo+ko+Ao+`$`),Mo=[`material`,`materials`,`bones`,`map`],No=class{constructor(e,t,n){let r=n||Po.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Po=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(wo,``)}static parseTrackName(e){let t=jo.exec(e);if(t===null)throw Error(`PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Mo.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn(`THREE.PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){console.error(`THREE.PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){console.error(`THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){console.error(`THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){console.error(`THREE.PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){console.error(`THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){console.error(`THREE.PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){console.error(`THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;console.error(`THREE.PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Po.Composite=No,Po.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Po.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Po.prototype.GetterByBindingType=[Po.prototype._getValue_direct,Po.prototype._getValue_array,Po.prototype._getValue_arrayElement,Po.prototype._getValue_toArray],Po.prototype.SetterByBindingTypeAndVersioning=[[Po.prototype._setValue_direct,Po.prototype._setValue_direct_setNeedsUpdate,Po.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Po.prototype._setValue_array,Po.prototype._setValue_array_setNeedsUpdate,Po.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Po.prototype._setValue_arrayElement,Po.prototype._setValue_arrayElement_setNeedsUpdate,Po.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Po.prototype._setValue_fromArray,Po.prototype._setValue_fromArray_setNeedsUpdate,Po.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Fo=new q,Io=class{constructor(e,t,n=0,r=1/0){this.ray=new hn(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new En,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error(`THREE.Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return Fo.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Fo),this}intersectObject(e,t=!0,n=[]){return Ro(e,this,n,t),n.sort(Lo),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)Ro(e[r],this,n,t);return n.sort(Lo),n}};function Lo(e,t){return e.distance-t.distance}function Ro(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)Ro(r[e],t,n,!0)}}function zo(e,t,n,r){let i=Bo(r);switch(n){case C:return e*t;case ee:return e*t/i.components*i.byteLength;case O:return e*t/i.components*i.byteLength;case k:return e*t*2/i.components*i.byteLength;case A:return e*t*2/i.components*i.byteLength;case w:return e*t*3/i.components*i.byteLength;case T:return e*t*4/i.components*i.byteLength;case te:return e*t*4/i.components*i.byteLength;case j:case M:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case N:case P:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case I:case ne:return Math.max(e,16)*Math.max(t,8)/4;case F:case L:return Math.max(e,8)*Math.max(t,8)/2;case re:case ie:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case R:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ae:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case oe:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case se:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case ce:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case le:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case ue:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case de:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case z:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case fe:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case pe:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case me:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case B:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case he:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case V:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case ge:case _e:case ve:return Math.ceil(e/4)*Math.ceil(t/4)*16;case ye:case be:return Math.ceil(e/4)*Math.ceil(t/4)*8;case xe:case Se:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Bo(e){switch(e){case u:case d:return{byteLength:1,components:1};case p:case f:case _:return{byteLength:2,components:1};case v:case y:return{byteLength:2,components:4};case h:case m:case g:return{byteLength:4,components:1};case x:case S:return{byteLength:4,components:3}}throw Error(`Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`180`}})),typeof window<`u`&&(window.__THREE__?console.warn(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`180`);function Vo(){let e=null,t=!1,n=null,r=null;function i(t,a){n(t,a),r=e.requestAnimationFrame(i)}return{start:function(){t!==!0&&n!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Ho(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var Y={alphahash_fragment:`#ifdef USE_ALPHAHASH
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
}`},X={common:{diffuse:{value:new J(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new G},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new G}},envmap:{envMap:{value:null},envMapRotation:{value:new G},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new G}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new G}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new G},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new G},normalScale:{value:new U(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new G},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new G}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new G}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new G}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new J(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new J(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0},uvTransform:{value:new G}},sprite:{diffuse:{value:new J(16777215)},opacity:{value:1},center:{value:new U(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new G},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0}}},Uo={basic:{uniforms:qr([X.common,X.specularmap,X.envmap,X.aomap,X.lightmap,X.fog]),vertexShader:Y.meshbasic_vert,fragmentShader:Y.meshbasic_frag},lambert:{uniforms:qr([X.common,X.specularmap,X.envmap,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.fog,X.lights,{emissive:{value:new J(0)}}]),vertexShader:Y.meshlambert_vert,fragmentShader:Y.meshlambert_frag},phong:{uniforms:qr([X.common,X.specularmap,X.envmap,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.fog,X.lights,{emissive:{value:new J(0)},specular:{value:new J(1118481)},shininess:{value:30}}]),vertexShader:Y.meshphong_vert,fragmentShader:Y.meshphong_frag},standard:{uniforms:qr([X.common,X.envmap,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.roughnessmap,X.metalnessmap,X.fog,X.lights,{emissive:{value:new J(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Y.meshphysical_vert,fragmentShader:Y.meshphysical_frag},toon:{uniforms:qr([X.common,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.gradientmap,X.fog,X.lights,{emissive:{value:new J(0)}}]),vertexShader:Y.meshtoon_vert,fragmentShader:Y.meshtoon_frag},matcap:{uniforms:qr([X.common,X.bumpmap,X.normalmap,X.displacementmap,X.fog,{matcap:{value:null}}]),vertexShader:Y.meshmatcap_vert,fragmentShader:Y.meshmatcap_frag},points:{uniforms:qr([X.points,X.fog]),vertexShader:Y.points_vert,fragmentShader:Y.points_frag},dashed:{uniforms:qr([X.common,X.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Y.linedashed_vert,fragmentShader:Y.linedashed_frag},depth:{uniforms:qr([X.common,X.displacementmap]),vertexShader:Y.depth_vert,fragmentShader:Y.depth_frag},normal:{uniforms:qr([X.common,X.bumpmap,X.normalmap,X.displacementmap,{opacity:{value:1}}]),vertexShader:Y.meshnormal_vert,fragmentShader:Y.meshnormal_frag},sprite:{uniforms:qr([X.sprite,X.fog]),vertexShader:Y.sprite_vert,fragmentShader:Y.sprite_frag},background:{uniforms:{uvTransform:{value:new G},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Y.background_vert,fragmentShader:Y.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new G}},vertexShader:Y.backgroundCube_vert,fragmentShader:Y.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Y.cube_vert,fragmentShader:Y.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Y.equirect_vert,fragmentShader:Y.equirect_frag},distanceRGBA:{uniforms:qr([X.common,X.displacementmap,{referencePosition:{value:new W},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Y.distanceRGBA_vert,fragmentShader:Y.distanceRGBA_frag},shadow:{uniforms:qr([X.lights,X.fog,{color:{value:new J(0)},opacity:{value:1}}]),vertexShader:Y.shadow_vert,fragmentShader:Y.shadow_frag}};Uo.physical={uniforms:qr([Uo.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new G},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new G},clearcoatNormalScale:{value:new U(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new G},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new G},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new G},sheen:{value:0},sheenColor:{value:new J(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new G},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new G},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new G},transmissionSamplerSize:{value:new U},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new G},attenuationDistance:{value:0},attenuationColor:{value:new J(0)},specularColor:{value:new J(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new G},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new G},anisotropyVector:{value:new U},anisotropyMap:{value:null},anisotropyMapTransform:{value:new G}}]),vertexShader:Y.meshphysical_vert,fragmentShader:Y.meshphysical_frag};var Wo={r:0,b:0,g:0},Go=new Tn,Ko=new q;function qo(e,t,n,r,i,a,o){let s=new J(0),c=a===!0?0:1,l,u,d=null,f=0,p=null;function m(e){let r=e.isScene===!0?e.background:null;return r&&r.isTexture&&(r=(e.backgroundBlurriness>0?n:t).get(r)),r}function h(t){let n=!1,i=m(t);i===null?_(s,c):i&&i.isColor&&(_(i,1),n=!0);let a=e.xr.getEnvironmentBlendMode();a===`additive`?r.buffers.color.setClear(0,0,0,1,o):a===`alpha-blend`&&r.buffers.color.setClear(0,0,0,0,o),(e.autoClear||n)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function g(t,n){let r=m(n);r&&(r.isCubeTexture||r.mapping===306)?(u===void 0&&(u=new Hr(new Gr(1,1,1),new $r({name:`BackgroundCubeMaterial`,uniforms:Kr(Uo.backgroundCube.uniforms),vertexShader:Uo.backgroundCube.vertexShader,fragmentShader:Uo.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute(`normal`),u.geometry.deleteAttribute(`uv`),u.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),Go.copy(n.backgroundRotation),Go.x*=-1,Go.y*=-1,Go.z*=-1,r.isCubeTexture&&r.isRenderTargetTexture===!1&&(Go.y*=-1,Go.z*=-1),u.material.uniforms.envMap.value=r,u.material.uniforms.flipEnvMap.value=r.isCubeTexture&&r.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Ko.makeRotationFromEuler(Go)),u.material.toneMapped=Dt.getTransfer(r.colorSpace)!==Fe,(d!==r||f!==r.version||p!==e.toneMapping)&&(u.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),u.layers.enableAll(),t.unshift(u,u.geometry,u.material,0,0,null)):r&&r.isTexture&&(l===void 0&&(l=new Hr(new Sa(2,2),new $r({name:`BackgroundMaterial`,uniforms:Kr(Uo.background.uniforms),vertexShader:Uo.background.vertexShader,fragmentShader:Uo.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=r,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.toneMapped=Dt.getTransfer(r.colorSpace)!==Fe,r.matrixAutoUpdate===!0&&r.updateMatrix(),l.material.uniforms.uvTransform.value.copy(r.matrix),(d!==r||f!==r.version||p!==e.toneMapping)&&(l.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null))}function _(t,n){t.getRGB(Wo,Yr(e)),r.buffers.color.setClear(Wo.r,Wo.g,Wo.b,n,o)}function v(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return s},setClearColor:function(e,t=1){s.set(e),c=t,_(s,c)},getClearAlpha:function(){return c},setClearAlpha:function(e){c=e,_(s,c)},render:h,addToRenderList:g,dispose:v}}function Jo(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n){let i=n.wireframe===!0,a=r[e.id];a===void 0&&(a={},r[e.id]=a);let o=a[t.id];o===void 0&&(o={},a[t.id]=o);let s=o[i];return s===void 0&&(s=f(c()),o[i]=s),s}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){w();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e.id]}function C(e){for(let t in r){let n=r[t];if(n[e.id]===void 0)continue;let i=n[e.id];for(let e in i)u(i[e].object),delete i[e];delete n[e.id]}}function w(){T(),o=!0,a!==i&&(a=i,l(a.object))}function T(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:w,resetDefaultState:T,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Yo(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}function c(e,i,a,s){if(a===0)return;let c=t.get(`WEBGL_multi_draw`);if(c===null)for(let t=0;t<e.length;t++)o(e[t],i[t],s[t]);else{c.multiDrawArraysInstancedWEBGL(r,e,0,i,0,s,0,a);let t=0;for(let e=0;e<a;e++)t+=i[e]*s[e];n.update(t,r,1)}}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s,this.renderMultiDrawInstances=c}function Xo(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!i)}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(console.warn(`THREE.WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=m>0,S=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,vertexTextures:x,maxSamples:S}}function Zo(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Wi,s=new G,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}function Qo(e){let t=new WeakMap;function n(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function r(r){if(r&&r.isTexture){let a=r.mapping;if(a===303||a===304){if(t.has(r)){let e=t.get(r).texture;return n(e,r.mapping)}{let a=r.image;if(a&&a.height>0){let o=new li(a.height);return o.fromEquirectangularTexture(e,r),t.set(r,o),r.addEventListener(`dispose`,i),n(o.texture,r.mapping)}return null}}}return r}function i(e){let n=e.target;n.removeEventListener(`dispose`,i);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function a(){t=new WeakMap}return{get:r,dispose:a}}var $o=4,es=[.125,.215,.35,.446,.526,.582],ts=20,ns=new go,rs=new J,is=null,as=0,os=0,ss=!1,cs=(1+Math.sqrt(5))/2,ls=1/cs,us=[new W(-cs,ls,0),new W(cs,ls,0),new W(-ls,0,cs),new W(ls,0,cs),new W(0,cs,-ls),new W(0,cs,ls),new W(-1,1,-1),new W(1,1,-1),new W(-1,1,1),new W(1,1,1)],ds=new W,fs=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=ds}=i;is=this._renderer.getRenderTarget(),as=this._renderer.getActiveCubeFace(),os=this._renderer.getActiveMipmapLevel(),ss=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=vs(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=_s(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(is,as,os),this._renderer.xr.enabled=ss,e.scissorTest=!1,hs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),is=this._renderer.getRenderTarget(),as=this._renderer.getActiveCubeFace(),os=this._renderer.getActiveMipmapLevel(),ss=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:s,minFilter:s,generateMipmaps:!1,type:_,format:T,colorSpace:Ne,depthBuffer:!1},r=ms(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ms(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=ps(r)),this._blurMaterial=gs(r,e,t)}return r}_compileMaterial(e){let t=new Hr(this._lodPlanes[0],e);this._renderer.compile(t,ns)}_sceneToCubeUV(e,t,n,r,i){let a=new ii(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(rs),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null));let d=new ur({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1}),f=new Hr(new Gr,d),p=!1,m=e.background;m?m.isColor&&(d.color.copy(m),e.background=null,p=!0):(d.color.copy(rs),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;hs(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(f,a),c.render(e,a)}f.geometry.dispose(),f.material.dispose(),c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=vs()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=_s());let i=r?this._cubemapMaterial:this._equirectMaterial,a=new Hr(this._lodPlanes[0],i),o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;hs(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,ns)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let t=1;t<r;t++){let n=Math.sqrt(this._sigmas[t]*this._sigmas[t]-this._sigmas[t-1]*this._sigmas[t-1]),i=us[(r-t-1)%us.length];this._blur(e,t-1,t,n,i)}t.autoClear=n}_blur(e,t,n,r,i){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,`latitudinal`,i),this._halfBlur(a,e,n,n,r,`longitudinal`,i)}_halfBlur(e,t,n,r,i,a,o){let s=this._renderer,c=this._blurMaterial;a!==`latitudinal`&&a!==`longitudinal`&&console.error(`blur direction must be either latitudinal or longitudinal!`);let l=new Hr(this._lodPlanes[r],c),u=c.uniforms,d=this._sizeLods[n]-1,f=isFinite(i)?Math.PI/(2*d):2*Math.PI/39,p=i/f,m=isFinite(i)?1+Math.floor(3*p):ts;m>ts&&console.warn(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ts}`);let h=[],g=0;for(let e=0;e<ts;++e){let t=e/p,n=Math.exp(-t*t/2);h.push(n),e===0?g+=n:e<m&&(g+=2*n)}for(let e=0;e<h.length;e++)h[e]=h[e]/g;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=a===`latitudinal`,o&&(u.poleAxis.value=o);let{_lodMax:_}=this;u.dTheta.value=f,u.mipInt.value=_-n;let v=this._sizeLods[r];hs(t,3*v*(r>_-$o?r-_+$o:0),4*(this._cubeSize-v),3*v,2*v),s.setRenderTarget(t),s.render(l,ns)}};function ps(e){let t=[],n=[],r=[],i=e,a=e-$o+1+es.length;for(let o=0;o<a;o++){let a=2**i;n.push(a);let s=1/a;o>e-$o?s=es[o-e+$o-1]:o===0&&(s=0),r.push(s);let c=1/(a-2),l=-c,u=1+c,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=new Float32Array(108),p=new Float32Array(72),m=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];f.set(r,18*e),p.set(d,12*e);let i=[e,e,e,e,e,e];m.set(i,6*e)}let h=new Ar;h.setAttribute(`position`,new yr(f,3)),h.setAttribute(`uv`,new yr(p,2)),h.setAttribute(`faceIndex`,new yr(m,1)),t.push(h),i>$o&&i--}return{lodPlanes:t,sizeLods:n,sigmas:r}}function ms(e,t,n){let r=new zt(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function hs(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function gs(e,t,n){let r=new Float32Array(ts),i=new W(0,1,0);return new $r({name:`SphericalGaussianBlur`,defines:{n:ts,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:ys(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function _s(){return new $r({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:ys(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function vs(){return new $r({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ys(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function ys(){return`

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
	`}function bs(e){let t=new WeakMap,n=null;function r(r){if(r&&r.isTexture){let o=r.mapping,s=o===303||o===304,c=o===301||o===302;if(s||c){let o=t.get(r),l=o===void 0?0:o.texture.pmremVersion;if(r.isRenderTargetTexture&&r.pmremVersion!==l)return n===null&&(n=new fs(e)),o=s?n.fromEquirectangular(r,o):n.fromCubemap(r,o),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),o.texture;if(o!==void 0)return o.texture;{let l=r.image;return s&&l&&l.height>0||c&&l&&i(l)?(n===null&&(n=new fs(e)),o=s?n.fromEquirectangular(r):n.fromCubemap(r),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),r.addEventListener(`dispose`,a),o.texture):null}}}return r}function i(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function a(e){let n=e.target;n.removeEventListener(`dispose`,a);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function o(){t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:o}}function xs(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r;switch(n){case`WEBGL_depth_texture`:r=e.getExtension(`WEBGL_depth_texture`)||e.getExtension(`MOZ_WEBGL_depth_texture`)||e.getExtension(`WEBKIT_WEBGL_depth_texture`);break;case`EXT_texture_filter_anisotropic`:r=e.getExtension(`EXT_texture_filter_anisotropic`)||e.getExtension(`MOZ_EXT_texture_filter_anisotropic`)||e.getExtension(`WEBKIT_EXT_texture_filter_anisotropic`);break;case`WEBGL_compressed_texture_s3tc`:r=e.getExtension(`WEBGL_compressed_texture_s3tc`)||e.getExtension(`MOZ_WEBGL_compressed_texture_s3tc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_s3tc`);break;case`WEBGL_compressed_texture_pvrtc`:r=e.getExtension(`WEBGL_compressed_texture_pvrtc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_pvrtc`);break;default:r=e.getExtension(n)}return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&St(`THREE.WebGLRenderer: `+e+` extension not supported.`),t}}}function Ss(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else if(i!==void 0){let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}else return;let s=new(vt(n)?xr:br)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function Cs(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}function d(e,i,s,c){if(s===0)return;let u=t.get(`WEBGL_multi_draw`);if(u===null)for(let t=0;t<e.length;t++)l(e[t]/o,i[t],c[t]);else{u.multiDrawElementsInstancedWEBGL(r,i,0,a,e,0,c,0,s);let t=0;for(let e=0;e<s;e++)t+=i[e]*c[e];n.update(t,r,1)}}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function ws(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:console.error(`THREE.WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Ts(e,t,n){let r=new WeakMap,i=new K;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),_=new Bt(h,p,m,u);_.type=g,_.needsUpdate=!0;let v=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*v;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:_,size:new U(p,m)},r.set(o,d);function y(){_.dispose(),r.delete(o),o.removeEventListener(`dispose`,y)}o.addEventListener(`dispose`,y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Es(e,t,n,r){let i=new WeakMap;function a(a){let o=r.render.frame,c=a.geometry,l=t.get(a,c);if(i.get(l)!==o&&(t.update(l),i.set(l,o)),a.isInstancedMesh&&(a.hasEventListener(`dispose`,s)===!1&&a.addEventListener(`dispose`,s),i.get(a)!==o&&(n.update(a.instanceMatrix,e.ARRAY_BUFFER),a.instanceColor!==null&&n.update(a.instanceColor,e.ARRAY_BUFFER),i.set(a,o))),a.isSkinnedMesh){let e=a.skeleton;i.get(e)!==o&&(e.update(),i.set(e,o))}return l}function o(){i=new WeakMap}function s(e){let t=e.target;t.removeEventListener(`dispose`,s),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:a,dispose:o}}var Ds=new Lt,Os=new ga(1,1),ks=new Bt,As=new Vt,js=new ci,Ms=[],Ns=[],Ps=new Float32Array(16),Fs=new Float32Array(9),Is=new Float32Array(4);function Ls(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Ms[i];if(a===void 0&&(a=new Float32Array(i),Ms[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Rs(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function zs(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Bs(e,t){let n=Ns[t];n===void 0&&(n=new Int32Array(t),Ns[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Vs(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Hs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Rs(n,t))return;e.uniform2fv(this.addr,t),zs(n,t)}}function Us(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Rs(n,t))return;e.uniform3fv(this.addr,t),zs(n,t)}}function Ws(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Rs(n,t))return;e.uniform4fv(this.addr,t),zs(n,t)}}function Gs(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Rs(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),zs(n,t)}else{if(Rs(n,r))return;Is.set(r),e.uniformMatrix2fv(this.addr,!1,Is),zs(n,r)}}function Ks(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Rs(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),zs(n,t)}else{if(Rs(n,r))return;Fs.set(r),e.uniformMatrix3fv(this.addr,!1,Fs),zs(n,r)}}function qs(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Rs(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),zs(n,t)}else{if(Rs(n,r))return;Ps.set(r),e.uniformMatrix4fv(this.addr,!1,Ps),zs(n,r)}}function Js(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Ys(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Rs(n,t))return;e.uniform2iv(this.addr,t),zs(n,t)}}function Xs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Rs(n,t))return;e.uniform3iv(this.addr,t),zs(n,t)}}function Zs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Rs(n,t))return;e.uniform4iv(this.addr,t),zs(n,t)}}function Qs(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function $s(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Rs(n,t))return;e.uniform2uiv(this.addr,t),zs(n,t)}}function ec(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Rs(n,t))return;e.uniform3uiv(this.addr,t),zs(n,t)}}function tc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Rs(n,t))return;e.uniform4uiv(this.addr,t),zs(n,t)}}function nc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(Os.compareFunction=515,a=Os):a=Ds,n.setTexture2D(t||a,i)}function rc(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||As,i)}function ic(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||js,i)}function ac(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||ks,i)}function oc(e){switch(e){case 5126:return Vs;case 35664:return Hs;case 35665:return Us;case 35666:return Ws;case 35674:return Gs;case 35675:return Ks;case 35676:return qs;case 5124:case 35670:return Js;case 35667:case 35671:return Ys;case 35668:case 35672:return Xs;case 35669:case 35673:return Zs;case 5125:return Qs;case 36294:return $s;case 36295:return ec;case 36296:return tc;case 35678:case 36198:case 36298:case 36306:case 35682:return nc;case 35679:case 36299:case 36307:return rc;case 35680:case 36300:case 36308:case 36293:return ic;case 36289:case 36303:case 36311:case 36292:return ac}}function sc(e,t){e.uniform1fv(this.addr,t)}function cc(e,t){let n=Ls(t,this.size,2);e.uniform2fv(this.addr,n)}function lc(e,t){let n=Ls(t,this.size,3);e.uniform3fv(this.addr,n)}function uc(e,t){let n=Ls(t,this.size,4);e.uniform4fv(this.addr,n)}function dc(e,t){let n=Ls(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function fc(e,t){let n=Ls(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function pc(e,t){let n=Ls(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function mc(e,t){e.uniform1iv(this.addr,t)}function hc(e,t){e.uniform2iv(this.addr,t)}function gc(e,t){e.uniform3iv(this.addr,t)}function _c(e,t){e.uniform4iv(this.addr,t)}function vc(e,t){e.uniform1uiv(this.addr,t)}function yc(e,t){e.uniform2uiv(this.addr,t)}function bc(e,t){e.uniform3uiv(this.addr,t)}function xc(e,t){e.uniform4uiv(this.addr,t)}function Sc(e,t,n){let r=this.cache,i=t.length,a=Bs(n,i);Rs(r,a)||(e.uniform1iv(this.addr,a),zs(r,a));for(let e=0;e!==i;++e)n.setTexture2D(t[e]||Ds,a[e])}function Cc(e,t,n){let r=this.cache,i=t.length,a=Bs(n,i);Rs(r,a)||(e.uniform1iv(this.addr,a),zs(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||As,a[e])}function wc(e,t,n){let r=this.cache,i=t.length,a=Bs(n,i);Rs(r,a)||(e.uniform1iv(this.addr,a),zs(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||js,a[e])}function Tc(e,t,n){let r=this.cache,i=t.length,a=Bs(n,i);Rs(r,a)||(e.uniform1iv(this.addr,a),zs(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||ks,a[e])}function Ec(e){switch(e){case 5126:return sc;case 35664:return cc;case 35665:return lc;case 35666:return uc;case 35674:return dc;case 35675:return fc;case 35676:return pc;case 5124:case 35670:return mc;case 35667:case 35671:return hc;case 35668:case 35672:return gc;case 35669:case 35673:return _c;case 5125:return vc;case 36294:return yc;case 36295:return bc;case 36296:return xc;case 35678:case 36198:case 36298:case 36306:case 35682:return Sc;case 35679:case 36299:case 36307:return Cc;case 35680:case 36300:case 36308:case 36293:return wc;case 36289:case 36303:case 36311:case 36292:return Tc}}var Dc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=oc(t.type)}},Oc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Ec(t.type)}},kc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Ac=/(\w+)(\])?(\[|\.)?/g;function jc(e,t){e.seq.push(t),e.map[t.id]=t}function Mc(e,t,n){let r=e.name,i=r.length;for(Ac.lastIndex=0;;){let a=Ac.exec(r),o=Ac.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){jc(n,l===void 0?new Dc(s,e,t):new Oc(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new kc(s),jc(n,e)),n=e}}}var Nc=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Mc(n,e.getUniformLocation(t,n.name),this)}}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Pc(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Fc=37297,Ic=0;function Lc(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Rc=new G;function zc(e){Dt._getMatrix(Rc,Dt.workingColorSpace,e);let t=`mat3( ${Rc.elements.map(e=>e.toFixed(4))} )`;switch(Dt.getTransfer(e)){case Pe:return[t,`LinearTransferOETF`];case Fe:return[t,`sRGBTransferOETF`];default:return console.warn(`THREE.WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Bc(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Lc(e.getShaderSource(t),r)}return i}function Vc(e,t){let n=zc(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}function Hc(e,t){let n;switch(t){case 1:n=`Linear`;break;case 2:n=`Reinhard`;break;case 3:n=`Cineon`;break;case 4:n=`ACESFilmic`;break;case 6:n=`AgX`;break;case 7:n=`Neutral`;break;case 5:n=`Custom`;break;default:console.warn(`THREE.WebGLProgram: Unsupported toneMapping:`,t),n=`Linear`}return`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Uc=new W;function Wc(){return Dt.getLuminanceCoefficients(Uc),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Uc.x.toFixed(4)}, ${Uc.y.toFixed(4)}, ${Uc.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Gc(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(Jc).join(`
`)}function Kc(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function qc(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function Jc(e){return e!==``}function Yc(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Xc(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Zc=/^[ \t]*#include +<([\w\d./]+)>/gm;function Qc(e){return e.replace(Zc,el)}var $c=new Map;function el(e,t){let n=Y[t];if(n===void 0){let e=$c.get(t);if(e!==void 0)n=Y[e],console.warn(`THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`Can not resolve #include <`+t+`>`)}return Qc(n)}var tl=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function nl(e){return e.replace(tl,rl)}function rl(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function il(e){let t=`precision ${e.precision} float;
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
#define LOW_PRECISION`),t}function al(e){let t=`SHADOWMAP_TYPE_BASIC`;return e.shadowMapType===1?t=`SHADOWMAP_TYPE_PCF`:e.shadowMapType===2?t=`SHADOWMAP_TYPE_PCF_SOFT`:e.shadowMapType===3&&(t=`SHADOWMAP_TYPE_VSM`),t}function ol(e){let t=`ENVMAP_TYPE_CUBE`;if(e.envMap)switch(e.envMapMode){case 301:case 302:t=`ENVMAP_TYPE_CUBE`;break;case 306:t=`ENVMAP_TYPE_CUBE_UV`}return t}function sl(e){let t=`ENVMAP_MODE_REFLECTION`;if(e.envMap)switch(e.envMapMode){case 302:t=`ENVMAP_MODE_REFRACTION`}return t}function cl(e){let t=`ENVMAP_BLENDING_NONE`;if(e.envMap)switch(e.combine){case 0:t=`ENVMAP_BLENDING_MULTIPLY`;break;case 1:t=`ENVMAP_BLENDING_MIX`;break;case 2:t=`ENVMAP_BLENDING_ADD`}return t}function ll(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function ul(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=al(n),l=ol(n),u=sl(n),d=cl(n),f=ll(n),p=Gc(n),m=Kc(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Jc).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Jc).join(`
`),_.length>0&&(_+=`
`)):(g=[il(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(Jc).join(`
`),_=[il(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor||n.batchingColor?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:Y.tonemapping_pars_fragment,n.toneMapping===0?``:Hc(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,Y.colorspace_pars_fragment,Vc(`linearToOutputTexel`,n.outputColorSpace),Wc(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(Jc).join(`
`)),o=Qc(o),o=Yc(o,n),o=Xc(o,n),s=Qc(s),s=Yc(s,n),s=Xc(s,n),o=nl(o),s=nl(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Pc(i,i.VERTEX_SHADER,y),S=Pc(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.morphTargets===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=Bc(i,x,`vertex`),n=Bc(i,S,`fragment`);console.error(`THREE.WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):console.warn(`THREE.WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new Nc(i,h),T=qc(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,Fc)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Ic++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var dl=0,fl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),i=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new pl(e),t.set(e,n)),n}},pl=class{constructor(e){this.id=dl++,this.code=e,this.usedTimes=0}};function ml(e,t,n,r,i,a,o){let s=new En,c=new fl,l=new Set,u=[],d=i.logarithmicDepthBuffer,f=i.vertexTextures,p=i.precision,m={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distanceRGBA`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function h(e){return l.add(e),e===0?`uv`:`uv${e}`}function g(a,s,u,g,_){let v=g.fog,y=_.geometry,b=a.isMeshStandardMaterial?g.environment:null,x=(a.isMeshStandardMaterial?n:t).get(a.envMap||b),S=x&&x.mapping===306?x.image.height:null,C=m[a.type];a.precision!==null&&(p=i.getMaxPrecision(a.precision),p!==a.precision&&console.warn(`THREE.WebGLProgram.getParameters:`,a.precision,`not supported, using`,p,`instead.`));let w=y.morphAttributes.position||y.morphAttributes.normal||y.morphAttributes.color,T=w===void 0?0:w.length,E=0;y.morphAttributes.position!==void 0&&(E=1),y.morphAttributes.normal!==void 0&&(E=2),y.morphAttributes.color!==void 0&&(E=3);let D,ee,O,k;if(C){let e=Uo[C];D=e.vertexShader,ee=e.fragmentShader}else D=a.vertexShader,ee=a.fragmentShader,c.update(a),O=c.getVertexShaderID(a),k=c.getFragmentShaderID(a);let A=e.getRenderTarget(),te=e.state.buffers.depth.getReversed(),j=_.isInstancedMesh===!0,M=_.isBatchedMesh===!0,N=!!a.map,P=!!a.matcap,F=!!x,I=!!a.aoMap,L=!!a.lightMap,ne=!!a.bumpMap,re=!!a.normalMap,ie=!!a.displacementMap,R=!!a.emissiveMap,ae=!!a.metalnessMap,oe=!!a.roughnessMap,se=a.anisotropy>0,ce=a.clearcoat>0,le=a.dispersion>0,ue=a.iridescence>0,de=a.sheen>0,z=a.transmission>0,fe=se&&!!a.anisotropyMap,pe=ce&&!!a.clearcoatMap,me=ce&&!!a.clearcoatNormalMap,B=ce&&!!a.clearcoatRoughnessMap,he=ue&&!!a.iridescenceMap,V=ue&&!!a.iridescenceThicknessMap,ge=de&&!!a.sheenColorMap,_e=de&&!!a.sheenRoughnessMap,ve=!!a.specularMap,ye=!!a.specularColorMap,be=!!a.specularIntensityMap,xe=z&&!!a.transmissionMap,Se=z&&!!a.thicknessMap,Ce=!!a.gradientMap,we=!!a.alphaMap,Te=a.alphaTest>0,Ee=!!a.alphaHash,De=!!a.extensions,Oe=0;a.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(Oe=e.toneMapping);let ke={shaderID:C,shaderType:a.type,shaderName:a.name,vertexShader:D,fragmentShader:ee,defines:a.defines,customVertexShaderID:O,customFragmentShaderID:k,isRawShaderMaterial:a.isRawShaderMaterial===!0,glslVersion:a.glslVersion,precision:p,batching:M,batchingColor:M&&_._colorsTexture!==null,instancing:j,instancingColor:j&&_.instanceColor!==null,instancingMorph:j&&_.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:A===null?e.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:Ne,alphaToCoverage:!!a.alphaToCoverage,map:N,matcap:P,envMap:F,envMapMode:F&&x.mapping,envMapCubeUVHeight:S,aoMap:I,lightMap:L,bumpMap:ne,normalMap:re,displacementMap:f&&ie,emissiveMap:R,normalMapObjectSpace:re&&a.normalMapType===1,normalMapTangentSpace:re&&a.normalMapType===0,metalnessMap:ae,roughnessMap:oe,anisotropy:se,anisotropyMap:fe,clearcoat:ce,clearcoatMap:pe,clearcoatNormalMap:me,clearcoatRoughnessMap:B,dispersion:le,iridescence:ue,iridescenceMap:he,iridescenceThicknessMap:V,sheen:de,sheenColorMap:ge,sheenRoughnessMap:_e,specularMap:ve,specularColorMap:ye,specularIntensityMap:be,transmission:z,transmissionMap:xe,thicknessMap:Se,gradientMap:Ce,opaque:a.transparent===!1&&a.blending===1&&a.alphaToCoverage===!1,alphaMap:we,alphaTest:Te,alphaHash:Ee,combine:a.combine,mapUv:N&&h(a.map.channel),aoMapUv:I&&h(a.aoMap.channel),lightMapUv:L&&h(a.lightMap.channel),bumpMapUv:ne&&h(a.bumpMap.channel),normalMapUv:re&&h(a.normalMap.channel),displacementMapUv:ie&&h(a.displacementMap.channel),emissiveMapUv:R&&h(a.emissiveMap.channel),metalnessMapUv:ae&&h(a.metalnessMap.channel),roughnessMapUv:oe&&h(a.roughnessMap.channel),anisotropyMapUv:fe&&h(a.anisotropyMap.channel),clearcoatMapUv:pe&&h(a.clearcoatMap.channel),clearcoatNormalMapUv:me&&h(a.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:B&&h(a.clearcoatRoughnessMap.channel),iridescenceMapUv:he&&h(a.iridescenceMap.channel),iridescenceThicknessMapUv:V&&h(a.iridescenceThicknessMap.channel),sheenColorMapUv:ge&&h(a.sheenColorMap.channel),sheenRoughnessMapUv:_e&&h(a.sheenRoughnessMap.channel),specularMapUv:ve&&h(a.specularMap.channel),specularColorMapUv:ye&&h(a.specularColorMap.channel),specularIntensityMapUv:be&&h(a.specularIntensityMap.channel),transmissionMapUv:xe&&h(a.transmissionMap.channel),thicknessMapUv:Se&&h(a.thicknessMap.channel),alphaMapUv:we&&h(a.alphaMap.channel),vertexTangents:!!y.attributes.tangent&&(re||se),vertexColors:a.vertexColors,vertexAlphas:a.vertexColors===!0&&!!y.attributes.color&&y.attributes.color.itemSize===4,pointsUvs:_.isPoints===!0&&!!y.attributes.uv&&(N||we),fog:!!v,useFog:a.fog===!0,fogExp2:!!v&&v.isFogExp2,flatShading:a.flatShading===!0&&a.wireframe===!1,sizeAttenuation:a.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:te,skinning:_.isSkinnedMesh===!0,morphTargets:y.morphAttributes.position!==void 0,morphNormals:y.morphAttributes.normal!==void 0,morphColors:y.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numDirLights:s.directional.length,numPointLights:s.point.length,numSpotLights:s.spot.length,numSpotLightMaps:s.spotLightMap.length,numRectAreaLights:s.rectArea.length,numHemiLights:s.hemi.length,numDirLightShadows:s.directionalShadowMap.length,numPointLightShadows:s.pointShadowMap.length,numSpotLightShadows:s.spotShadowMap.length,numSpotLightShadowsWithMaps:s.numSpotLightShadowsWithMaps,numLightProbes:s.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:a.dithering,shadowMapEnabled:e.shadowMap.enabled&&u.length>0,shadowMapType:e.shadowMap.type,toneMapping:Oe,decodeVideoTexture:N&&a.map.isVideoTexture===!0&&Dt.getTransfer(a.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:R&&a.emissiveMap.isVideoTexture===!0&&Dt.getTransfer(a.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:a.premultipliedAlpha,doubleSided:a.side===2,flipSided:a.side===1,useDepthPacking:a.depthPacking>=0,depthPacking:a.depthPacking||0,index0AttributeName:a.index0AttributeName,extensionClipCullDistance:De&&a.extensions.clipCullDistance===!0&&r.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(De&&a.extensions.multiDraw===!0||M)&&r.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:r.has(`KHR_parallel_shader_compile`),customProgramCacheKey:a.customProgramCacheKey()};return ke.vertexUv1s=l.has(1),ke.vertexUv2s=l.has(2),ke.vertexUv3s=l.has(3),l.clear(),ke}function _(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(v(n,t),y(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function v(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function y(e,t){s.disableAll(),t.supportsVertexTextures&&s.enable(0),t.instancing&&s.enable(1),t.instancingColor&&s.enable(2),t.instancingMorph&&s.enable(3),t.matcap&&s.enable(4),t.envMap&&s.enable(5),t.normalMapObjectSpace&&s.enable(6),t.normalMapTangentSpace&&s.enable(7),t.clearcoat&&s.enable(8),t.iridescence&&s.enable(9),t.alphaTest&&s.enable(10),t.vertexColors&&s.enable(11),t.vertexAlphas&&s.enable(12),t.vertexUv1s&&s.enable(13),t.vertexUv2s&&s.enable(14),t.vertexUv3s&&s.enable(15),t.vertexTangents&&s.enable(16),t.anisotropy&&s.enable(17),t.alphaHash&&s.enable(18),t.batching&&s.enable(19),t.dispersion&&s.enable(20),t.batchingColor&&s.enable(21),t.gradientMap&&s.enable(22),e.push(s.mask),s.disableAll(),t.fog&&s.enable(0),t.useFog&&s.enable(1),t.flatShading&&s.enable(2),t.logarithmicDepthBuffer&&s.enable(3),t.reversedDepthBuffer&&s.enable(4),t.skinning&&s.enable(5),t.morphTargets&&s.enable(6),t.morphNormals&&s.enable(7),t.morphColors&&s.enable(8),t.premultipliedAlpha&&s.enable(9),t.shadowMapEnabled&&s.enable(10),t.doubleSided&&s.enable(11),t.flipSided&&s.enable(12),t.useDepthPacking&&s.enable(13),t.dithering&&s.enable(14),t.transmission&&s.enable(15),t.sheen&&s.enable(16),t.opaque&&s.enable(17),t.pointsUvs&&s.enable(18),t.decodeVideoTexture&&s.enable(19),t.decodeVideoTextureEmissive&&s.enable(20),t.alphaToCoverage&&s.enable(21),e.push(s.mask)}function b(e){let t=m[e.type],n;if(t){let e=Uo[t];n=Xr.clone(e.uniforms)}else n=e.uniforms;return n}function x(t,n){let r;for(let e=0,t=u.length;e<t;e++){let t=u[e];if(t.cacheKey===n){r=t,++r.usedTimes;break}}return r===void 0&&(r=new ul(e,n,t,a),u.push(r)),r}function S(e){if(--e.usedTimes===0){let t=u.indexOf(e);u[t]=u[u.length-1],u.pop(),e.destroy()}}function C(e){c.remove(e)}function w(){c.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:b,acquireProgram:x,releaseProgram:S,releaseShaderCache:C,programs:u,dispose:w}}function hl(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function gl(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.z===t.z?e.id-t.id:e.z-t.z:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function _l(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function vl(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(n,r,i,a,o,s){let c=e[t];return c===void 0?(c={id:n.id,object:n,geometry:r,material:i,groupOrder:a,renderOrder:n.renderOrder,z:o,group:s},e[t]=c):(c.id=n.id,c.object=n,c.geometry=r,c.material=i,c.groupOrder=a,c.renderOrder=n.renderOrder,c.z=o,c.group=s),t++,c}function s(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.push(u):a.transparent===!0?i.push(u):n.push(u)}function c(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function l(e,t){n.length>1&&n.sort(e||gl),r.length>1&&r.sort(t||_l),i.length>1&&i.sort(t||_l)}function u(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:s,unshift:c,finish:u,sort:l}}function yl(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new vl,e.set(t,[i])):n>=r.length?(i=new vl,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function bl(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new W,color:new J};break;case`SpotLight`:n={position:new W,direction:new W,color:new J,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new W,color:new J,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new W,skyColor:new J,groundColor:new J};break;case`RectAreaLight`:n={color:new J,position:new W,halfWidth:new W,halfHeight:new W}}return e[t.id]=n,n}}}function xl(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new U};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new U};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new U,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Sl=0;function Cl(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function wl(e){let t=new bl,n=xl(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new W);let i=new W,a=new q,o=new q;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0;i.sort(Cl);for(let e=0,y=i.length;e<y;e++){let y=i[e],b=y.color,x=y.intensity,S=y.distance,C=y.shadow&&y.shadow.map?y.shadow.map.texture:null;if(y.isAmbientLight)a+=b.r*x,o+=b.g*x,s+=b.b*x;else if(y.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(y.sh.coefficients[e],x);v++}else if(y.isDirectionalLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[c]=t,r.directionalShadowMap[c]=C,r.directionalShadowMatrix[c]=y.shadow.matrix,p++}r.directional[c]=e,c++}else if(y.isSpotLight){let e=t.get(y);e.position.setFromMatrixPosition(y.matrixWorld),e.color.copy(b).multiplyScalar(x),e.distance=S,e.coneCos=Math.cos(y.angle),e.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),e.decay=y.decay,r.spot[u]=e;let i=y.shadow;if(y.map&&(r.spotLightMap[g]=y.map,g++,i.updateMatrices(y),y.castShadow&&_++),r.spotLightMatrix[u]=i.matrix,y.castShadow){let e=n.get(y);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[u]=e,r.spotShadowMap[u]=C,h++}u++}else if(y.isRectAreaLight){let e=t.get(y);e.color.copy(b).multiplyScalar(x),e.halfWidth.set(y.width*.5,0,0),e.halfHeight.set(0,y.height*.5,0),r.rectArea[d]=e,d++}else if(y.isPointLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),e.distance=y.distance,e.decay=y.decay,y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[l]=t,r.pointShadowMap[l]=C,r.pointShadowMatrix[l]=y.shadow.matrix,m++}r.point[l]=e,l++}else if(y.isHemisphereLight){let e=t.get(y);e.skyColor.copy(y.color).multiplyScalar(x),e.groundColor.copy(y.groundColor).multiplyScalar(x),r.hemi[f]=e,f++}}d>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=X.LTC_FLOAT_1,r.rectAreaLTC2=X.LTC_FLOAT_2):(r.rectAreaLTC1=X.LTC_HALF_1,r.rectAreaLTC2=X.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let y=r.hash;(y.directionalLength!==c||y.pointLength!==l||y.spotLength!==u||y.rectAreaLength!==d||y.hemiLength!==f||y.numDirectionalShadows!==p||y.numPointShadows!==m||y.numSpotShadows!==h||y.numSpotMaps!==g||y.numLightProbes!==v)&&(r.directional.length=c,r.spot.length=u,r.rectArea.length=d,r.point.length=l,r.hemi.length=f,r.directionalShadow.length=p,r.directionalShadowMap.length=p,r.pointShadow.length=m,r.pointShadowMap.length=m,r.spotShadow.length=h,r.spotShadowMap.length=h,r.directionalShadowMatrix.length=p,r.pointShadowMatrix.length=m,r.spotLightMatrix.length=h+g-_,r.spotLightMap.length=g,r.numSpotLightShadowsWithMaps=_,r.numLightProbes=v,y.directionalLength=c,y.pointLength=l,y.spotLength=u,y.rectAreaLength=d,y.hemiLength=f,y.numDirectionalShadows=p,y.numPointShadows=m,y.numSpotShadows=h,y.numSpotMaps=g,y.numLightProbes=v,r.version=Sl++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=t.matrixWorldInverse;for(let t=0,f=e.length;t<f;t++){let f=e[t];if(f.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),n++}else if(f.isSpotLight){let e=r.spot[c];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),c++}else if(f.isRectAreaLight){let e=r.rectArea[l];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),o.identity(),a.copy(f.matrixWorld),a.premultiply(d),o.extractRotation(a),e.halfWidth.set(f.width*.5,0,0),e.halfHeight.set(0,f.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),l++}else if(f.isPointLight){let e=r.point[s];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),s++}else if(f.isHemisphereLight){let e=r.hemi[u];e.direction.setFromMatrixPosition(f.matrixWorld),e.direction.transformDirection(d),u++}}}return{setup:s,setupView:c,state:r}}function Tl(e){let t=new wl(e),n=[],r=[];function i(e){l.camera=e,n.length=0,r.length=0}function a(e){n.push(e)}function o(e){r.push(e)}function s(){t.setup(n)}function c(e){t.setupView(n,e)}let l={lightsArray:n,shadowsArray:r,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:s,setupLightsView:c,pushLight:a,pushShadow:o}}function El(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Tl(e),t.set(n,[a])):r>=i.length?(a=new Tl(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var Dl=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Ol=`uniform sampler2D shadow_pass;
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
}`;function kl(e,t,n){let r=new Ji,a=new U,o=new U,s=new K,c=new Ea({depthPacking:je}),l=new Da,u={},d=n.maxTextureSize,f={0:1,1:0,2:2},p=new $r({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new U},radius:{value:4}},vertexShader:Dl,fragmentShader:Ol}),m=p.clone();m.defines.HORIZONTAL_PASS=1;let h=new Ar;h.setAttribute(`position`,new yr(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let g=new Hr(h,p),_=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let v=this.type;this.render=function(t,n,c){if(_.enabled===!1||_.autoUpdate===!1&&_.needsUpdate===!1||t.length===0)return;let l=e.getRenderTarget(),u=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.state;p.setBlending(0),p.buffers.depth.getReversed()===!0?p.buffers.color.setClear(0,0,0,0):p.buffers.color.setClear(1,1,1,1),p.buffers.depth.setTest(!0),p.setScissorTest(!1);let m=v!==3&&this.type===3,h=v===3&&this.type!==3;for(let l=0,u=t.length;l<u;l++){let u=t[l],f=u.shadow;if(f===void 0){console.warn(`THREE.WebGLShadowMap:`,u,`has no shadow.`);continue}if(f.autoUpdate===!1&&f.needsUpdate===!1)continue;a.copy(f.mapSize);let g=f.getFrameExtents();if(a.multiply(g),o.copy(f.mapSize),(a.x>d||a.y>d)&&(a.x>d&&(o.x=Math.floor(d/g.x),a.x=o.x*g.x,f.mapSize.x=o.x),a.y>d&&(o.y=Math.floor(d/g.y),a.y=o.y*g.y,f.mapSize.y=o.y)),f.map===null||m===!0||h===!0){let e=this.type===3?{}:{minFilter:i,magFilter:i};f.map!==null&&f.map.dispose(),f.map=new zt(a.x,a.y,e),f.map.texture.name=u.name+`.shadowMap`,f.camera.updateProjectionMatrix()}e.setRenderTarget(f.map),e.clear();let _=f.getViewportCount();for(let e=0;e<_;e++){let t=f.getViewport(e);s.set(o.x*t.x,o.y*t.y,o.x*t.z,o.y*t.w),p.viewport(s),f.updateMatrices(u,e),r=f.getFrustum(),x(n,c,f.camera,u,this.type)}f.isPointLightShadow!==!0&&this.type===3&&y(f,c),f.needsUpdate=!1}v=this.type,_.needsUpdate=!1,e.setRenderTarget(l,u,f)};function y(n,r){let i=t.update(g);p.defines.VSM_SAMPLES!==n.blurSamples&&(p.defines.VSM_SAMPLES=n.blurSamples,m.defines.VSM_SAMPLES=n.blurSamples,p.needsUpdate=!0,m.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new zt(a.x,a.y)),p.uniforms.shadow_pass.value=n.map.texture,p.uniforms.resolution.value=n.mapSize,p.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,i,p,g,null),m.uniforms.shadow_pass.value=n.mapPass.texture,m.uniforms.resolution.value=n.mapSize,m.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,i,m,g,null)}function b(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?l:c,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=u[e];r===void 0&&(r={},u[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,S)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?f[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function x(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||r.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=b(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=b(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)x(c[e],i,a,o,s)}function S(e){e.target.removeEventListener(`dispose`,S);for(let t in u){let n=u[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}var Al={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function jl(e,t){function n(){let t=!1,n=new K,r=null,i=new K(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?R(e.DEPTH_TEST):ae(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=Al[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(r&&(t=1-t),e.clearDepth(t),o=t)},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?R(e.STENCIL_TEST):ae(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new J(0,0,0),w=0,T=!1,E=null,D=null,ee=null,O=null,k=null,A=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),te=!1,j=0,M=e.getParameter(e.VERSION);M.indexOf(`WebGL`)===-1?M.indexOf(`OpenGL ES`)!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(M)[1]),te=j>=2):(j=parseFloat(/^WebGL (\d)/.exec(M)[1]),te=j>=1);let N=null,P={},F=e.getParameter(e.SCISSOR_BOX),I=e.getParameter(e.VIEWPORT),L=new K().fromArray(F),ne=new K().fromArray(I);function re(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let ie={};ie[e.TEXTURE_2D]=re(e.TEXTURE_2D,e.TEXTURE_2D,1),ie[e.TEXTURE_CUBE_MAP]=re(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ie[e.TEXTURE_2D_ARRAY]=re(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ie[e.TEXTURE_3D]=re(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),R(e.DEPTH_TEST),o.setFunc(3),fe(!1),pe(1),R(e.CULL_FACE),de(0);function R(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function ae(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function oe(t,n){return d[t]!==n&&(e.bindFramebuffer(t,n),d[t]=n,t===e.DRAW_FRAMEBUFFER&&(d[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(d[e.DRAW_FRAMEBUFFER]=n),!0)}function se(t,n){let r=p,i=!1;if(t){r=f.get(n),r===void 0&&(r=[],f.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function ce(t){return m!==t&&(e.useProgram(t),m=t,!0)}let le={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};le[103]=e.MIN,le[104]=e.MAX;let ue={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function de(t,n,r,i,a,o,s,c,l,u){if(t===0){h===!0&&(ae(e.BLEND),h=!1);return}if(h===!1&&(R(e.BLEND),h=!0),t!==5){if(t!==g||u!==T){if((_!==100||b!==100)&&(e.blendEquation(e.FUNC_ADD),_=100,b=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:console.error(`THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:console.error(`THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}v=null,y=null,x=null,S=null,C.set(0,0,0),w=0,g=t,T=u}return}a||=n,o||=r,s||=i,(n!==_||a!==b)&&(e.blendEquationSeparate(le[n],le[a]),_=n,b=a),(r!==v||i!==y||o!==x||s!==S)&&(e.blendFuncSeparate(ue[r],ue[i],ue[o],ue[s]),v=r,y=i,x=o,S=s),(c.equals(C)===!1||l!==w)&&(e.blendColor(c.r,c.g,c.b,l),C.copy(c),w=l),g=t,T=!1}function z(t,n){t.side===2?ae(e.CULL_FACE):R(e.CULL_FACE);let r=t.side===1;n&&(r=!r),fe(r),t.blending===1&&t.transparent===!1?de(0):de(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),B(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?R(e.SAMPLE_ALPHA_TO_COVERAGE):ae(e.SAMPLE_ALPHA_TO_COVERAGE)}function fe(t){E!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),E=t)}function pe(t){t===0?ae(e.CULL_FACE):(R(e.CULL_FACE),t!==D&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),D=t}function me(t){t!==ee&&(te&&e.lineWidth(t),ee=t)}function B(t,n,r){t?(R(e.POLYGON_OFFSET_FILL),(O!==n||k!==r)&&(e.polygonOffset(n,r),O=n,k=r)):ae(e.POLYGON_OFFSET_FILL)}function he(t){t?R(e.SCISSOR_TEST):ae(e.SCISSOR_TEST)}function V(t){t===void 0&&(t=e.TEXTURE0+A-1),N!==t&&(e.activeTexture(t),N=t)}function ge(t,n,r){r===void 0&&(r=N===null?e.TEXTURE0+A-1:N);let i=P[r];i===void 0&&(i={type:void 0,texture:void 0},P[r]=i),(i.type!==t||i.texture!==n)&&(N!==r&&(e.activeTexture(r),N=r),e.bindTexture(t,n||ie[t]),i.type=t,i.texture=n)}function _e(){let t=P[N];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function ve(){try{e.compressedTexImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function ye(){try{e.compressedTexImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function be(){try{e.texSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function xe(){try{e.texSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Se(){try{e.compressedTexSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ce(){try{e.compressedTexSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function we(){try{e.texStorage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Te(){try{e.texStorage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ee(){try{e.texImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function De(){try{e.texImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Oe(t){L.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),L.copy(t))}function ke(t){ne.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ne.copy(t))}function Ae(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function je(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Me(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),u={},N=null,P={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new J(0,0,0),w=0,T=!1,E=null,D=null,ee=null,O=null,k=null,L.set(0,0,e.canvas.width,e.canvas.height),ne.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:R,disable:ae,bindFramebuffer:oe,drawBuffers:se,useProgram:ce,setBlending:de,setMaterial:z,setFlipSided:fe,setCullFace:pe,setLineWidth:me,setPolygonOffset:B,setScissorTest:he,activeTexture:V,bindTexture:ge,unbindTexture:_e,compressedTexImage2D:ve,compressedTexImage3D:ye,texImage2D:Ee,texImage3D:De,updateUBOMapping:Ae,uniformBlockBinding:je,texStorage2D:we,texStorage3D:Te,texSubImage2D:be,texSubImage3D:xe,compressedTexSubImage2D:Se,compressedTexSubImage3D:Ce,scissor:Oe,viewport:ke,reset:Me}}function Ml(e,u,d,f,p,m,h){let g=u.has(`WEBGL_multisampled_render_to_texture`)?u.get(`WEBGL_multisampled_render_to_texture`):null,_=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),v=new U,y=new WeakMap,b,x=new WeakMap,S=!1;try{S=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function C(e,t){return S?new OffscreenCanvas(e,t):yt(`canvas`)}function w(e,t,n){let r=1,i=Ee(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);b===void 0&&(b=C(n,a));let o=t?C(n,a):b;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),console.warn(`THREE.WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&console.warn(`THREE.WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function T(e){return e.generateMipmaps}function E(t){e.generateMipmap(t)}function ee(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function O(t,n,r,i,a=!1){if(t!==null){if(e[t]!==void 0)return e[t];console.warn(`THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '`+t+`'`)}let o=n;if(n===e.RED&&(r===e.FLOAT&&(o=e.R32F),r===e.HALF_FLOAT&&(o=e.R16F),r===e.UNSIGNED_BYTE&&(o=e.R8)),n===e.RED_INTEGER&&(r===e.UNSIGNED_BYTE&&(o=e.R8UI),r===e.UNSIGNED_SHORT&&(o=e.R16UI),r===e.UNSIGNED_INT&&(o=e.R32UI),r===e.BYTE&&(o=e.R8I),r===e.SHORT&&(o=e.R16I),r===e.INT&&(o=e.R32I)),n===e.RG&&(r===e.FLOAT&&(o=e.RG32F),r===e.HALF_FLOAT&&(o=e.RG16F),r===e.UNSIGNED_BYTE&&(o=e.RG8)),n===e.RG_INTEGER&&(r===e.UNSIGNED_BYTE&&(o=e.RG8UI),r===e.UNSIGNED_SHORT&&(o=e.RG16UI),r===e.UNSIGNED_INT&&(o=e.RG32UI),r===e.BYTE&&(o=e.RG8I),r===e.SHORT&&(o=e.RG16I),r===e.INT&&(o=e.RG32I)),n===e.RGB_INTEGER&&(r===e.UNSIGNED_BYTE&&(o=e.RGB8UI),r===e.UNSIGNED_SHORT&&(o=e.RGB16UI),r===e.UNSIGNED_INT&&(o=e.RGB32UI),r===e.BYTE&&(o=e.RGB8I),r===e.SHORT&&(o=e.RGB16I),r===e.INT&&(o=e.RGB32I)),n===e.RGBA_INTEGER&&(r===e.UNSIGNED_BYTE&&(o=e.RGBA8UI),r===e.UNSIGNED_SHORT&&(o=e.RGBA16UI),r===e.UNSIGNED_INT&&(o=e.RGBA32UI),r===e.BYTE&&(o=e.RGBA8I),r===e.SHORT&&(o=e.RGBA16I),r===e.INT&&(o=e.RGBA32I)),n===e.RGB&&(r===e.UNSIGNED_INT_5_9_9_9_REV&&(o=e.RGB9_E5),r===e.UNSIGNED_INT_10F_11F_11F_REV&&(o=e.R11F_G11F_B10F)),n===e.RGBA){let t=a?Pe:Dt.getTransfer(i);r===e.FLOAT&&(o=e.RGBA32F),r===e.HALF_FLOAT&&(o=e.RGBA16F),r===e.UNSIGNED_BYTE&&(o=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),r===e.UNSIGNED_SHORT_4_4_4_4&&(o=e.RGBA4),r===e.UNSIGNED_SHORT_5_5_5_1&&(o=e.RGB5_A1)}return(o===e.R16F||o===e.R32F||o===e.RG16F||o===e.RG32F||o===e.RGBA16F||o===e.RGBA32F)&&u.get(`EXT_color_buffer_float`),o}function k(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,console.warn(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function A(e,t){return T(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function te(e){let t=e.target;t.removeEventListener(`dispose`,te),M(t),t.isVideoTexture&&y.delete(t)}function j(e){let t=e.target;t.removeEventListener(`dispose`,j),P(t)}function M(e){let t=f.get(e);if(t.__webglInit===void 0)return;let n=e.source,r=x.get(n);if(r){let i=r[t.__cacheKey];i.usedTimes--,i.usedTimes===0&&N(e),Object.keys(r).length===0&&x.delete(n)}f.remove(e)}function N(t){let n=f.get(t);e.deleteTexture(n.__webglTexture);let r=t.source,i=x.get(r);delete i[n.__cacheKey],h.memory.textures--}function P(t){let n=f.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),f.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let r=t.textures;for(let t=0,n=r.length;t<n;t++){let n=f.get(r[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),h.memory.textures--),f.remove(r[t])}f.remove(t)}let F=0;function I(){F=0}function L(){let e=F;return e>=p.maxTextures&&console.warn(`THREE.WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+p.maxTextures),F+=1,e}function ne(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function re(t,n){let r=f.get(t);if(t.isVideoTexture&&we(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&r.__version!==t.version){let e=t.image;if(e===null)console.warn(`THREE.WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)console.warn(`THREE.WebGLRenderer: Texture marked for update but image is incomplete`);else{fe(r,t,n);return}}else t.isExternalTexture&&(r.__webglTexture=t.sourceTexture?t.sourceTexture:null);d.bindTexture(e.TEXTURE_2D,r.__webglTexture,e.TEXTURE0+n)}function ie(t,n){let r=f.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&r.__version!==t.version){fe(r,t,n);return}d.bindTexture(e.TEXTURE_2D_ARRAY,r.__webglTexture,e.TEXTURE0+n)}function R(t,n){let r=f.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&r.__version!==t.version){fe(r,t,n);return}d.bindTexture(e.TEXTURE_3D,r.__webglTexture,e.TEXTURE0+n)}function ae(t,n){let r=f.get(t);if(t.version>0&&r.__version!==t.version){pe(r,t,n);return}d.bindTexture(e.TEXTURE_CUBE_MAP,r.__webglTexture,e.TEXTURE0+n)}let oe={[t]:e.REPEAT,[n]:e.CLAMP_TO_EDGE,[r]:e.MIRRORED_REPEAT},se={[i]:e.NEAREST,[a]:e.NEAREST_MIPMAP_NEAREST,[o]:e.NEAREST_MIPMAP_LINEAR,[s]:e.LINEAR,[c]:e.LINEAR_MIPMAP_NEAREST,[l]:e.LINEAR_MIPMAP_LINEAR},ce={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function le(t,n){if(n.type===1015&&u.has(`OES_texture_float_linear`)===!1&&(n.magFilter===1006||n.magFilter===1007||n.magFilter===1005||n.magFilter===1008||n.minFilter===1006||n.minFilter===1007||n.minFilter===1005||n.minFilter===1008)&&console.warn(`THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(t,e.TEXTURE_WRAP_S,oe[n.wrapS]),e.texParameteri(t,e.TEXTURE_WRAP_T,oe[n.wrapT]),(t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY)&&e.texParameteri(t,e.TEXTURE_WRAP_R,oe[n.wrapR]),e.texParameteri(t,e.TEXTURE_MAG_FILTER,se[n.magFilter]),e.texParameteri(t,e.TEXTURE_MIN_FILTER,se[n.minFilter]),n.compareFunction&&(e.texParameteri(t,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(t,e.TEXTURE_COMPARE_FUNC,ce[n.compareFunction])),u.has(`EXT_texture_filter_anisotropic`)===!0){if(n.magFilter===1003||n.minFilter!==1005&&n.minFilter!==1008||n.type===1015&&u.has(`OES_texture_float_linear`)===!1)return;if(n.anisotropy>1||f.get(n).__currentAnisotropy){let r=u.get(`EXT_texture_filter_anisotropic`);e.texParameterf(t,r.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(n.anisotropy,p.getMaxAnisotropy())),f.get(n).__currentAnisotropy=n.anisotropy}}}function ue(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,te));let i=n.source,a=x.get(i);a===void 0&&(a={},x.set(i,a));let o=ne(n);if(o!==t.__cacheKey){a[o]===void 0&&(a[o]={texture:e.createTexture(),usedTimes:0},h.memory.textures++,r=!0),a[o].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&N(n)),t.__cacheKey=o,t.__webglTexture=a[o].texture}return r}function de(e,t,n){return Math.floor(Math.floor(e/n)/t)}function z(t,n,r,i){let a=t.updateRanges;if(a.length===0)d.texSubImage2D(e.TEXTURE_2D,0,0,0,n.width,n.height,r,i,n.data);else{a.sort((e,t)=>e.start-t.start);let o=0;for(let e=1;e<a.length;e++){let t=a[o],r=a[e],i=t.start+t.count,s=de(r.start,n.width,4),c=de(t.start,n.width,4);r.start<=i+1&&s===c&&de(r.start+r.count-1,n.width,4)===s?t.count=Math.max(t.count,r.start+r.count-t.start):(++o,a[o]=r)}a.length=o+1;let s=e.getParameter(e.UNPACK_ROW_LENGTH),c=e.getParameter(e.UNPACK_SKIP_PIXELS),l=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,n.width);for(let t=0,o=a.length;t<o;t++){let o=a[t],s=Math.floor(o.start/4),c=Math.ceil(o.count/4),l=s%n.width,u=Math.floor(s/n.width),f=c;e.pixelStorei(e.UNPACK_SKIP_PIXELS,l),e.pixelStorei(e.UNPACK_SKIP_ROWS,u),d.texSubImage2D(e.TEXTURE_2D,0,l,u,f,1,r,i,n.data)}t.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,s),e.pixelStorei(e.UNPACK_SKIP_PIXELS,c),e.pixelStorei(e.UNPACK_SKIP_ROWS,l)}}function fe(t,n,r){let i=e.TEXTURE_2D;(n.isDataArrayTexture||n.isCompressedArrayTexture)&&(i=e.TEXTURE_2D_ARRAY),n.isData3DTexture&&(i=e.TEXTURE_3D);let a=ue(t,n),o=n.source;d.bindTexture(i,t.__webglTexture,e.TEXTURE0+r);let s=f.get(o);if(o.version!==s.__version||a===!0){d.activeTexture(e.TEXTURE0+r);let t=Dt.getPrimaries(Dt.workingColorSpace),c=n.colorSpace===``?null:Dt.getPrimaries(n.colorSpace),l=n.colorSpace===``||t===c?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,n.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,n.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,n.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,l);let u=w(n.image,!1,p.maxTextureSize);u=Te(n,u);let f=m.convert(n.format,n.colorSpace),h=m.convert(n.type),g=O(n.internalFormat,f,h,n.colorSpace,n.isVideoTexture);le(i,n);let _,v=n.mipmaps,y=n.isVideoTexture!==!0,b=s.__version===void 0||a===!0,x=o.dataReady,S=A(n,u);if(n.isDepthTexture)g=k(n.format===D,n.type),b&&(y?d.texStorage2D(e.TEXTURE_2D,1,g,u.width,u.height):d.texImage2D(e.TEXTURE_2D,0,g,u.width,u.height,0,f,h,null));else if(n.isDataTexture){if(v.length>0){y&&b&&d.texStorage2D(e.TEXTURE_2D,S,g,v[0].width,v[0].height);for(let t=0,n=v.length;t<n;t++)_=v[t],y?x&&d.texSubImage2D(e.TEXTURE_2D,t,0,0,_.width,_.height,f,h,_.data):d.texImage2D(e.TEXTURE_2D,t,g,_.width,_.height,0,f,h,_.data);n.generateMipmaps=!1}else y?(b&&d.texStorage2D(e.TEXTURE_2D,S,g,u.width,u.height),x&&z(n,u,f,h)):d.texImage2D(e.TEXTURE_2D,0,g,u.width,u.height,0,f,h,u.data)}else if(n.isCompressedTexture){if(n.isCompressedArrayTexture){y&&b&&d.texStorage3D(e.TEXTURE_2D_ARRAY,S,g,v[0].width,v[0].height,u.depth);for(let t=0,r=v.length;t<r;t++)if(_=v[t],n.format!==1023){if(f!==null){if(y){if(x){if(n.layerUpdates.size>0){let r=zo(_.width,_.height,n.format,n.type);for(let i of n.layerUpdates){let n=_.data.subarray(i*r/_.data.BYTES_PER_ELEMENT,(i+1)*r/_.data.BYTES_PER_ELEMENT);d.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,i,_.width,_.height,1,f,n)}n.clearLayerUpdates()}else d.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,_.width,_.height,u.depth,f,_.data)}}else d.compressedTexImage3D(e.TEXTURE_2D_ARRAY,t,g,_.width,_.height,u.depth,0,_.data,0,0)}else console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else y?x&&d.texSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,_.width,_.height,u.depth,f,h,_.data):d.texImage3D(e.TEXTURE_2D_ARRAY,t,g,_.width,_.height,u.depth,0,f,h,_.data)}else{y&&b&&d.texStorage2D(e.TEXTURE_2D,S,g,v[0].width,v[0].height);for(let t=0,r=v.length;t<r;t++)_=v[t],n.format===1023?y?x&&d.texSubImage2D(e.TEXTURE_2D,t,0,0,_.width,_.height,f,h,_.data):d.texImage2D(e.TEXTURE_2D,t,g,_.width,_.height,0,f,h,_.data):f===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):y?x&&d.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,_.width,_.height,f,_.data):d.compressedTexImage2D(e.TEXTURE_2D,t,g,_.width,_.height,0,_.data)}}else if(n.isDataArrayTexture){if(y){if(b&&d.texStorage3D(e.TEXTURE_2D_ARRAY,S,g,u.width,u.height,u.depth),x){if(n.layerUpdates.size>0){let t=zo(u.width,u.height,n.format,n.type);for(let r of n.layerUpdates){let n=u.data.subarray(r*t/u.data.BYTES_PER_ELEMENT,(r+1)*t/u.data.BYTES_PER_ELEMENT);d.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,r,u.width,u.height,1,f,h,n)}n.clearLayerUpdates()}else d.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,u.width,u.height,u.depth,f,h,u.data)}}else d.texImage3D(e.TEXTURE_2D_ARRAY,0,g,u.width,u.height,u.depth,0,f,h,u.data)}else if(n.isData3DTexture)y?(b&&d.texStorage3D(e.TEXTURE_3D,S,g,u.width,u.height,u.depth),x&&d.texSubImage3D(e.TEXTURE_3D,0,0,0,0,u.width,u.height,u.depth,f,h,u.data)):d.texImage3D(e.TEXTURE_3D,0,g,u.width,u.height,u.depth,0,f,h,u.data);else if(n.isFramebufferTexture){if(b){if(y)d.texStorage2D(e.TEXTURE_2D,S,g,u.width,u.height);else{let t=u.width,n=u.height;for(let r=0;r<S;r++)d.texImage2D(e.TEXTURE_2D,r,g,t,n,0,f,h,null),t>>=1,n>>=1}}}else if(v.length>0){if(y&&b){let t=Ee(v[0]);d.texStorage2D(e.TEXTURE_2D,S,g,t.width,t.height)}for(let t=0,n=v.length;t<n;t++)_=v[t],y?x&&d.texSubImage2D(e.TEXTURE_2D,t,0,0,f,h,_):d.texImage2D(e.TEXTURE_2D,t,g,f,h,_);n.generateMipmaps=!1}else if(y){if(b){let t=Ee(u);d.texStorage2D(e.TEXTURE_2D,S,g,t.width,t.height)}x&&d.texSubImage2D(e.TEXTURE_2D,0,0,0,f,h,u)}else d.texImage2D(e.TEXTURE_2D,0,g,f,h,u);T(n)&&E(i),s.__version=o.version,n.onUpdate&&n.onUpdate(n)}t.__version=n.version}function pe(t,n,r){if(n.image.length!==6)return;let i=ue(t,n),a=n.source;d.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+r);let o=f.get(a);if(a.version!==o.__version||i===!0){d.activeTexture(e.TEXTURE0+r);let t=Dt.getPrimaries(Dt.workingColorSpace),s=n.colorSpace===``?null:Dt.getPrimaries(n.colorSpace),c=n.colorSpace===``||t===s?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,n.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,n.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,n.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,c);let l=n.isCompressedTexture||n.image[0].isCompressedTexture,u=n.image[0]&&n.image[0].isDataTexture,f=[];for(let e=0;e<6;e++)!l&&!u?f[e]=w(n.image[e],!0,p.maxCubemapSize):f[e]=u?n.image[e].image:n.image[e],f[e]=Te(n,f[e]);let h=f[0],g=m.convert(n.format,n.colorSpace),_=m.convert(n.type),v=O(n.internalFormat,g,_,n.colorSpace),y=n.isVideoTexture!==!0,b=o.__version===void 0||i===!0,x=a.dataReady,S=A(n,h);le(e.TEXTURE_CUBE_MAP,n);let C;if(l){y&&b&&d.texStorage2D(e.TEXTURE_CUBE_MAP,S,v,h.width,h.height);for(let t=0;t<6;t++){C=f[t].mipmaps;for(let r=0;r<C.length;r++){let i=C[r];n.format===1023?y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,_,i.data):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,v,i.width,i.height,0,g,_,i.data):g===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):y?x&&d.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,i.data):d.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,v,i.width,i.height,0,i.data)}}}else{if(C=n.mipmaps,y&&b){C.length>0&&S++;let t=Ee(f[0]);d.texStorage2D(e.TEXTURE_CUBE_MAP,S,v,t.width,t.height)}for(let t=0;t<6;t++)if(u){y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,f[t].width,f[t].height,g,_,f[t].data):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,f[t].width,f[t].height,0,g,_,f[t].data);for(let n=0;n<C.length;n++){let r=C[n].image[t].image;y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,0,0,r.width,r.height,g,_,r.data):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,v,r.width,r.height,0,g,_,r.data)}}else{y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,g,_,f[t]):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,g,_,f[t]);for(let n=0;n<C.length;n++){let r=C[n];y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,0,0,g,_,r.image[t]):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,v,g,_,r.image[t])}}}T(n)&&E(e.TEXTURE_CUBE_MAP),o.__version=a.version,n.onUpdate&&n.onUpdate(n)}t.__version=n.version}function me(t,n,r,i,a,o){let s=m.convert(r.format,r.colorSpace),c=m.convert(r.type),l=O(r.internalFormat,s,c,r.colorSpace),u=f.get(n),p=f.get(r);if(p.__renderTarget=n,!u.__hasExternalTextures){let t=Math.max(1,n.width>>o),r=Math.max(1,n.height>>o);a===e.TEXTURE_3D||a===e.TEXTURE_2D_ARRAY?d.texImage3D(a,o,l,t,r,n.depth,0,s,c,null):d.texImage2D(a,o,l,t,r,0,s,c,null)}d.bindFramebuffer(e.FRAMEBUFFER,t),Ce(n)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,i,a,p.__webglTexture,0,Se(n)):(a===e.TEXTURE_2D||a>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&a<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,i,a,p.__webglTexture,o),d.bindFramebuffer(e.FRAMEBUFFER,null)}function B(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=k(n.stencilBuffer,a),s=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,c=Se(n);Ce(n)?g.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,c,o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,c,o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,s,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let a=t[i],o=m.convert(a.format,a.colorSpace),s=m.convert(a.type),c=O(a.internalFormat,o,s,a.colorSpace),l=Se(n);r&&Ce(n)===!1?e.renderbufferStorageMultisample(e.RENDERBUFFER,l,c,n.width,n.height):Ce(n)?g.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,l,c,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,c,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function he(t,n){if(n&&n.isWebGLCubeRenderTarget)throw Error(`Depth Texture with cube render targets is not supported`);if(d.bindFramebuffer(e.FRAMEBUFFER,t),!(n.depthTexture&&n.depthTexture.isDepthTexture))throw Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);let r=f.get(n.depthTexture);r.__renderTarget=n,(!r.__webglTexture||n.depthTexture.image.width!==n.width||n.depthTexture.image.height!==n.height)&&(n.depthTexture.image.width=n.width,n.depthTexture.image.height=n.height,n.depthTexture.needsUpdate=!0),re(n.depthTexture,0);let i=r.__webglTexture,a=Se(n);if(n.depthTexture.format===1026)Ce(n)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,i,0,a):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,i,0);else if(n.depthTexture.format===1027)Ce(n)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,i,0,a):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,i,0);else throw Error(`Unknown depthTexture format`)}function V(t){let n=f.get(t),r=t.isWebGLCubeRenderTarget===!0;if(n.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(n.__depthDisposeCallback&&n.__depthDisposeCallback(),e){let t=()=>{delete n.__boundDepthTexture,delete n.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),n.__depthDisposeCallback=t}n.__boundDepthTexture=e}if(t.depthTexture&&!n.__autoAllocateDepthBuffer){if(r)throw Error(`target.depthTexture not supported in Cube render targets`);let e=t.texture.mipmaps;e&&e.length>0?he(n.__webglFramebuffer[0],t):he(n.__webglFramebuffer,t)}else if(r){n.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(d.bindFramebuffer(e.FRAMEBUFFER,n.__webglFramebuffer[r]),n.__webglDepthbuffer[r]===void 0)n.__webglDepthbuffer[r]=e.createRenderbuffer(),B(n.__webglDepthbuffer[r],t,!1);else{let i=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=n.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,i,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?d.bindFramebuffer(e.FRAMEBUFFER,n.__webglFramebuffer[0]):d.bindFramebuffer(e.FRAMEBUFFER,n.__webglFramebuffer),n.__webglDepthbuffer===void 0)n.__webglDepthbuffer=e.createRenderbuffer(),B(n.__webglDepthbuffer,t,!1);else{let r=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,i=n.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,i),e.framebufferRenderbuffer(e.FRAMEBUFFER,r,e.RENDERBUFFER,i)}}d.bindFramebuffer(e.FRAMEBUFFER,null)}function ge(t,n,r){let i=f.get(t);n!==void 0&&me(i.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),r!==void 0&&V(t)}function _e(t){let n=t.texture,r=f.get(t),i=f.get(n);t.addEventListener(`dispose`,j);let a=t.textures,o=t.isWebGLCubeRenderTarget===!0,s=a.length>1;if(s||(i.__webglTexture===void 0&&(i.__webglTexture=e.createTexture()),i.__version=n.version,h.memory.textures++),o){r.__webglFramebuffer=[];for(let t=0;t<6;t++)if(n.mipmaps&&n.mipmaps.length>0){r.__webglFramebuffer[t]=[];for(let i=0;i<n.mipmaps.length;i++)r.__webglFramebuffer[t][i]=e.createFramebuffer()}else r.__webglFramebuffer[t]=e.createFramebuffer()}else{if(n.mipmaps&&n.mipmaps.length>0){r.__webglFramebuffer=[];for(let t=0;t<n.mipmaps.length;t++)r.__webglFramebuffer[t]=e.createFramebuffer()}else r.__webglFramebuffer=e.createFramebuffer();if(s)for(let t=0,n=a.length;t<n;t++){let n=f.get(a[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),h.memory.textures++)}if(t.samples>0&&Ce(t)===!1){r.__webglMultisampledFramebuffer=e.createFramebuffer(),r.__webglColorRenderbuffer=[],d.bindFramebuffer(e.FRAMEBUFFER,r.__webglMultisampledFramebuffer);for(let n=0;n<a.length;n++){let i=a[n];r.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,r.__webglColorRenderbuffer[n]);let o=m.convert(i.format,i.colorSpace),s=m.convert(i.type),c=O(i.internalFormat,o,s,i.colorSpace,t.isXRRenderTarget===!0),l=Se(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,l,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,r.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(r.__webglDepthRenderbuffer=e.createRenderbuffer(),B(r.__webglDepthRenderbuffer,t,!0)),d.bindFramebuffer(e.FRAMEBUFFER,null)}}if(o){d.bindTexture(e.TEXTURE_CUBE_MAP,i.__webglTexture),le(e.TEXTURE_CUBE_MAP,n);for(let i=0;i<6;i++)if(n.mipmaps&&n.mipmaps.length>0)for(let a=0;a<n.mipmaps.length;a++)me(r.__webglFramebuffer[i][a],t,n,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+i,a);else me(r.__webglFramebuffer[i],t,n,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+i,0);T(n)&&E(e.TEXTURE_CUBE_MAP),d.unbindTexture()}else if(s){for(let n=0,i=a.length;n<i;n++){let i=a[n],o=f.get(i),s=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(s=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),d.bindTexture(s,o.__webglTexture),le(s,i),me(r.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0+n,s,0),T(i)&&E(s)}d.unbindTexture()}else{let a=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(a=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),d.bindTexture(a,i.__webglTexture),le(a,n),n.mipmaps&&n.mipmaps.length>0)for(let i=0;i<n.mipmaps.length;i++)me(r.__webglFramebuffer[i],t,n,e.COLOR_ATTACHMENT0,a,i);else me(r.__webglFramebuffer,t,n,e.COLOR_ATTACHMENT0,a,0);T(n)&&E(a),d.unbindTexture()}t.depthBuffer&&V(t)}function ve(e){let t=e.textures;for(let n=0,r=t.length;n<r;n++){let r=t[n];if(T(r)){let t=ee(e),n=f.get(r).__webglTexture;d.bindTexture(t,n),E(t),d.unbindTexture()}}}let ye=[],be=[];function xe(t){if(t.samples>0){if(Ce(t)===!1){let n=t.textures,r=t.width,i=t.height,a=e.COLOR_BUFFER_BIT,o=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,s=f.get(t),c=n.length>1;if(c)for(let t=0;t<n.length;t++)d.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),d.bindFramebuffer(e.FRAMEBUFFER,s.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);d.bindFramebuffer(e.READ_FRAMEBUFFER,s.__webglMultisampledFramebuffer);let l=t.texture.mipmaps;l&&l.length>0?d.bindFramebuffer(e.DRAW_FRAMEBUFFER,s.__webglFramebuffer[0]):d.bindFramebuffer(e.DRAW_FRAMEBUFFER,s.__webglFramebuffer);for(let l=0;l<n.length;l++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(a|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(a|=e.STENCIL_BUFFER_BIT)),c){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,s.__webglColorRenderbuffer[l]);let t=f.get(n[l]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,r,i,0,0,r,i,a,e.NEAREST),_===!0&&(ye.length=0,be.length=0,ye.push(e.COLOR_ATTACHMENT0+l),t.depthBuffer&&t.resolveDepthBuffer===!1&&(ye.push(o),be.push(o),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,be)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,ye))}if(d.bindFramebuffer(e.READ_FRAMEBUFFER,null),d.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),c)for(let t=0;t<n.length;t++){d.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,s.__webglColorRenderbuffer[t]);let r=f.get(n[t]).__webglTexture;d.bindFramebuffer(e.FRAMEBUFFER,s.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,r,0)}d.bindFramebuffer(e.DRAW_FRAMEBUFFER,s.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.resolveDepthBuffer===!1&&_){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function Se(e){return Math.min(p.maxSamples,e.samples)}function Ce(e){let t=f.get(e);return e.samples>0&&u.has(`WEBGL_multisampled_render_to_texture`)===!0&&t.__useRenderToTexture!==!1}function we(e){let t=h.render.frame;y.get(e)!==t&&(y.set(e,t),e.update())}function Te(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(Dt.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&console.warn(`THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):console.error(`THREE.WebGLTextures: Unsupported texture color space:`,n)),t}function Ee(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(v.width=e.naturalWidth||e.width,v.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(v.width=e.displayWidth,v.height=e.displayHeight):(v.width=e.width,v.height=e.height),v}this.allocateTextureUnit=L,this.resetTextureUnits=I,this.setTexture2D=re,this.setTexture2DArray=ie,this.setTexture3D=R,this.setTextureCube=ae,this.rebindTextures=ge,this.setupRenderTarget=_e,this.updateRenderTargetMipmap=ve,this.updateMultisampleRenderTarget=xe,this.setupDepthRenderbuffer=V,this.setupFrameBufferTexture=me,this.useMultisampledRTT=Ce}function Nl(e,t){function n(n,r=``){let i,a=Dt.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Pl=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Fl=`
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

}`,Il=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new _a(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new $r({vertexShader:Pl,fragmentShader:Fl,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Hr(new Sa(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Ll=class extends Ve{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,d=null,f=null,p=null,m=null,g=typeof XRWebGLBinding<`u`,_=new Il,v={},y=t.getContextAttributes(),x=null,S=null,C=[],w=[],ee=new U,O=null,k=new ii;k.viewport=new K;let A=new ii;A.viewport=new K;let te=[k,A],j=new So,M=null,N=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=C[e];return t===void 0&&(t=new fi,C[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=C[e];return t===void 0&&(t=new fi,C[e]=t),t.getGripSpace()},this.getHand=function(e){let t=C[e];return t===void 0&&(t=new fi,C[e]=t),t.getHandSpace()};function P(e){let t=w.indexOf(e.inputSource);if(t===-1)return;let n=C[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function F(){r.removeEventListener(`select`,P),r.removeEventListener(`selectstart`,P),r.removeEventListener(`selectend`,P),r.removeEventListener(`squeeze`,P),r.removeEventListener(`squeezestart`,P),r.removeEventListener(`squeezeend`,P),r.removeEventListener(`end`,F),r.removeEventListener(`inputsourceschange`,I);for(let e=0;e<C.length;e++){let t=w[e];t!==null&&(w[e]=null,C[e].disconnect(t))}M=null,N=null,_.reset();for(let e in v)delete v[e];e.setRenderTarget(x),p=null,f=null,d=null,r=null,S=null,se.stop(),n.isPresenting=!1,e.setPixelRatio(O),e.setSize(ee.width,ee.height,!1),n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return f===null?p:f},this.getBinding=function(){return d===null&&g&&(d=new XRWebGLBinding(r,t)),d},this.getFrame=function(){return m},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(x=e.getRenderTarget(),r.addEventListener(`select`,P),r.addEventListener(`selectstart`,P),r.addEventListener(`selectend`,P),r.addEventListener(`squeeze`,P),r.addEventListener(`squeezestart`,P),r.addEventListener(`squeezeend`,P),r.addEventListener(`end`,F),r.addEventListener(`inputsourceschange`,I),y.xrCompatible!==!0&&await t.makeXRCompatible(),O=e.getPixelRatio(),e.getSize(ee),g&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;y.depth&&(o=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=y.stencil?D:E,a=y.stencil?b:h);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};d=this.getBinding(),f=d.createProjectionLayer(s),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),S=new zt(f.textureWidth,f.textureHeight,{format:T,type:u,depthTexture:new ga(f.textureWidth,f.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{let n={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:i};p=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),S=new zt(p.framebufferWidth,p.framebufferHeight,{format:T,type:u,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),se.setContext(r),se.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function I(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=w.indexOf(n);r>=0&&(w[r]=null,C[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=w.indexOf(n);if(r===-1){for(let e=0;e<C.length;e++)if(e>=w.length){w.push(n),r=e;break}else if(w[e]===null){w[e]=n,r=e;break}if(r===-1)break}let i=C[r];i&&i.connect(n)}}let L=new W,ne=new W;function re(e,t,n){L.setFromMatrixPosition(t.matrixWorld),ne.setFromMatrixPosition(n.matrixWorld);let r=L.distanceTo(ne),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function ie(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;_.texture!==null&&(_.depthNear>0&&(t=_.depthNear),_.depthFar>0&&(n=_.depthFar)),j.near=A.near=k.near=t,j.far=A.far=k.far=n,(M!==j.near||N!==j.far)&&(r.updateRenderState({depthNear:j.near,depthFar:j.far}),M=j.near,N=j.far),j.layers.mask=e.layers.mask|6,k.layers.mask=j.layers.mask&3,A.layers.mask=j.layers.mask&5;let i=e.parent,a=j.cameras;ie(j,i);for(let e=0;e<a.length;e++)ie(a[e],i);a.length===2?re(j,k,A):j.projectionMatrix.copy(k.projectionMatrix),R(e,j,i)};function R(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=Ge*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return j},this.getFoveation=function(){if(f!==null||p!==null)return s},this.setFoveation=function(e){s=e,f!==null&&(f.fixedFoveation=e),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=e)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(j)},this.getCameraTexture=function(e){return v[e]};let ae=null;function oe(t,i){if(l=i.getViewerPose(c||a),m=i,l!==null){let t=l.views;p!==null&&(e.setRenderTargetFramebuffer(S,p.framebuffer),e.setRenderTarget(S));let i=!1;t.length!==j.cameras.length&&(j.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(p!==null)a=p.getViewport(r);else{let t=d.getViewSubImage(f,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(S,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(S))}let o=te[n];o===void 0&&(o=new ii,o.layers.enable(n),o.viewport=new K,te[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(j.matrix.copy(o.matrix),j.matrix.decompose(j.position,j.quaternion,j.scale)),i===!0&&j.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&g){d=n.getBinding();let e=d.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&_.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&g){e.state.unbindTexture(),d=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=v[n];e||(e=new _a,v[n]=e);let t=d.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<C.length;e++){let t=w[e],n=C[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}ae&&ae(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),m=null}let se=new Vo;se.setAnimationLoop(oe),this.setAnimationLoop=function(e){ae=e},this.dispose=function(){}}},Rl=new Tn,zl=new q;function Bl(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,Yr(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isMeshBasicMaterial||t.isMeshLambertMaterial?a(e,t):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,Rl.copy(o),Rl.x*=-1,Rl.y*=-1,Rl.z*=-1,a.isCubeTexture&&a.isRenderTargetTexture===!1&&(Rl.y*=-1,Rl.z*=-1),e.envMapRotation.value.setFromMatrix4(zl.makeRotationFromEuler(Rl)),e.flipEnvMap.value=a.isCubeTexture&&a.isRenderTargetTexture===!1?-1:1,e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Vl(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(m(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return console.error(`THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let t=0,n=r.length;t<n;t++){let n=Array.isArray(r[t])?r[t]:[r[t]];for(let r=0,i=n.length;r<i;r++){let i=n[r];if(p(i,t,r,a)===!0){let t=i.__offset,n=Array.isArray(i.value)?i.value:[i.value],r=0;for(let a=0;a<n.length;a++){let o=n[a],s=h(o);typeof o==`number`||typeof o==`boolean`?(i.__data[0]=o,e.bufferSubData(e.UNIFORM_BUFFER,t+r,i.__data)):o.isMatrix3?(i.__data[0]=o.elements[0],i.__data[1]=o.elements[1],i.__data[2]=o.elements[2],i.__data[3]=0,i.__data[4]=o.elements[3],i.__data[5]=o.elements[4],i.__data[6]=o.elements[5],i.__data[7]=0,i.__data[8]=o.elements[6],i.__data[9]=o.elements[7],i.__data[10]=o.elements[8],i.__data[11]=0):(o.toArray(i.__data,r),r+=s.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,t,i.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=h(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?console.warn(`THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.`):console.warn(`THREE.WebGLRenderer: Unsupported uniform value type.`,e),t}function g(t){let n=t.target;n.removeEventListener(`dispose`,g);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:_}}var Hl=class{constructor(e={}){let{canvas:t=bt(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:d=`default`,failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:p=!1}=e;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);m=n.getContextAttributes().alpha}else m=a;let h=new Uint32Array(4),g=new Int32Array(4),v=null,y=null,b=[],x=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let S=this,C=!1;this._outputColorSpace=Me;let w=0,T=0,E=null,D=-1,ee=null,O=new K,k=new K,A=null,te=new J(0),j=0,M=t.width,N=t.height,P=1,F=null,I=null,L=new K(0,0,M,N),ne=new K(0,0,M,N),re=!1,ie=new Ji,R=!1,ae=!1,oe=new q,se=new W,ce=new K,le={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ue=!1;function de(){return E===null?P:1}let z=n;function fe(e,n){return t.getContext(e,n)}try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:d,failIfMajorPerformanceCaveat:f};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r180`),t.addEventListener(`webglcontextlost`,ze,!1),t.addEventListener(`webglcontextrestored`,Ve,!1),t.addEventListener(`webglcontextcreationerror`,He,!1),z===null){let t=`webgl2`;if(z=fe(t,e),z===null)throw fe(t)?Error(`Error creating WebGL context with your selected attributes.`):Error(`Error creating WebGL context.`)}}catch(e){throw console.error(`THREE.WebGLRenderer: `+e.message),e}let pe,me,B,he,V,ge,_e,ve,ye,be,xe,Se,Ce,we,Te,Ee,De,Oe,ke,Ae,je,Pe,Fe,Ie;function Le(){pe=new xs(z),pe.init(),Pe=new Nl(z,pe),me=new Xo(z,pe,e,Pe),B=new jl(z,pe),me.reversedDepthBuffer&&p&&B.buffers.depth.setReversed(!0),he=new ws(z),V=new hl,ge=new Ml(z,pe,B,V,me,Pe,he),_e=new Qo(S),ve=new bs(S),ye=new Ho(z),Fe=new Jo(z,ye),be=new Ss(z,ye,he,Fe),xe=new Es(z,be,ye,he),ke=new Ts(z,me,ge),Ee=new Zo(V),Se=new ml(S,_e,ve,pe,me,Fe,Ee),Ce=new Bl(S,V),we=new yl,Te=new El(pe),Oe=new qo(S,_e,ve,B,xe,m,s),De=new kl(S,xe,me),Ie=new Vl(z,he,me,B),Ae=new Yo(z,pe,he),je=new Cs(z,pe,he),he.programs=Se.programs,S.capabilities=me,S.extensions=pe,S.properties=V,S.renderLists=we,S.shadowMap=De,S.state=B,S.info=he}Le();let Re=new Ll(S,z);this.xr=Re,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){let e=pe.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=pe.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return P},this.setPixelRatio=function(e){e!==void 0&&(P=e,this.setSize(M,N,!1))},this.getSize=function(e){return e.set(M,N)},this.setSize=function(e,n,r=!0){if(Re.isPresenting){console.warn(`THREE.WebGLRenderer: Can't change size while VR device is presenting.`);return}M=e,N=n,t.width=Math.floor(e*P),t.height=Math.floor(n*P),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(M*P,N*P).floor()},this.setDrawingBufferSize=function(e,n,r){M=e,N=n,P=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.getCurrentViewport=function(e){return e.copy(O)},this.getViewport=function(e){return e.copy(L)},this.setViewport=function(e,t,n,r){e.isVector4?L.set(e.x,e.y,e.z,e.w):L.set(e,t,n,r),B.viewport(O.copy(L).multiplyScalar(P).round())},this.getScissor=function(e){return e.copy(ne)},this.setScissor=function(e,t,n,r){e.isVector4?ne.set(e.x,e.y,e.z,e.w):ne.set(e,t,n,r),B.scissor(k.copy(ne).multiplyScalar(P).round())},this.getScissorTest=function(){return re},this.setScissorTest=function(e){B.setScissorTest(re=e)},this.setOpaqueSort=function(e){F=e},this.setTransparentSort=function(e){I=e},this.getClearColor=function(e){return e.copy(Oe.getClearColor())},this.setClearColor=function(){Oe.setClearColor(...arguments)},this.getClearAlpha=function(){return Oe.getClearAlpha()},this.setClearAlpha=function(){Oe.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(E!==null){let t=E.texture.format;e=t===1033||t===1031||t===1029}if(e){let e=E.texture.type,t=e===1009||e===1014||e===1012||e===1020||e===1017||e===1018,n=Oe.getClearColor(),r=Oe.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(h[0]=i,h[1]=a,h[2]=o,h[3]=r,z.clearBufferuiv(z.COLOR,0,h)):(g[0]=i,g[1]=a,g[2]=o,g[3]=r,z.clearBufferiv(z.COLOR,0,g))}else r|=z.COLOR_BUFFER_BIT}t&&(r|=z.DEPTH_BUFFER_BIT),n&&(r|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener(`webglcontextlost`,ze,!1),t.removeEventListener(`webglcontextrestored`,Ve,!1),t.removeEventListener(`webglcontextcreationerror`,He,!1),Oe.dispose(),we.dispose(),Te.dispose(),V.dispose(),_e.dispose(),ve.dispose(),xe.dispose(),Fe.dispose(),Ie.dispose(),Se.dispose(),Re.dispose(),Re.removeEventListener(`sessionstart`,Je),Re.removeEventListener(`sessionend`,Ye),Xe.stop()};function ze(e){e.preventDefault(),console.log(`THREE.WebGLRenderer: Context Lost.`),C=!0}function Ve(){console.log(`THREE.WebGLRenderer: Context Restored.`),C=!1;let e=he.autoReset,t=De.enabled,n=De.autoUpdate,r=De.needsUpdate,i=De.type;Le(),he.autoReset=e,De.enabled=t,De.autoUpdate=n,De.needsUpdate=r,De.type=i}function He(e){console.error(`THREE.WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function Ue(e){let t=e.target;t.removeEventListener(`dispose`,Ue),We(t)}function We(e){Ge(e),V.remove(e)}function Ge(e){let t=V.get(e).programs;t!==void 0&&(t.forEach(function(e){Se.releaseProgram(e)}),e.isShaderMaterial&&Se.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=le);let o=i.isMesh&&i.matrixWorld.determinant()<0,s=at(e,t,n,r,i);B.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=be.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Fe.setup(i,r,s,n,c);let h,g=Ae;if(c!==null&&(h=ye.get(c),g=je,g.setIndex(h)),i.isMesh)r.wireframe===!0?(B.setLineWidth(r.wireframeLinewidth*de()),g.setMode(z.LINES)):g.setMode(z.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),B.setLineWidth(e*de()),i.isLineSegments?g.setMode(z.LINES):i.isLineLoop?g.setMode(z.LINE_LOOP):g.setMode(z.LINE_STRIP)}else i.isPoints?g.setMode(z.POINTS):i.isSprite&&g.setMode(z.TRIANGLES);if(i.isBatchedMesh){if(i._multiDrawInstances!==null)St(`THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.`),g.renderMultiDrawInstances(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount,i._multiDrawInstances);else if(pe.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?ye.get(c).bytesPerElement:1,o=V.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(z,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function Ke(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,nt(e,t,n),e.side=0,e.needsUpdate=!0,nt(e,t,n),e.side=2):nt(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),y=Te.get(n),y.init(t),x.push(y),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(y.pushLight(e),e.castShadow&&y.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(y.pushLight(e),e.castShadow&&y.pushShadow(e))}),y.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t){if(Array.isArray(t))for(let i=0;i<t.length;i++){let a=t[i];Ke(a,n,e),r.add(a)}else Ke(t,n,e),r.add(t)}}),y=x.pop(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){V.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}pe.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let H=null;function qe(e){H&&H(e)}function Je(){Xe.stop()}function Ye(){Xe.start()}let Xe=new Vo;Xe.setAnimationLoop(qe),typeof self<`u`&&Xe.setContext(self),this.setAnimationLoop=function(e){H=e,Re.setAnimationLoop(e),e===null?Xe.stop():Xe.start()},Re.addEventListener(`sessionstart`,Je),Re.addEventListener(`sessionend`,Ye),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){console.error(`THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(C===!0)return;if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),Re.enabled===!0&&Re.isPresenting===!0&&(Re.cameraAutoUpdate===!0&&Re.updateCamera(t),t=Re.getCamera()),e.isScene===!0&&e.onBeforeRender(S,e,t,E),y=Te.get(e,x.length),y.init(t),x.push(y),oe.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),ie.setFromProjectionMatrix(oe,Be,t.reversedDepth),ae=this.localClippingEnabled,R=Ee.init(this.clippingPlanes,ae),v=we.get(e,b.length),v.init(),b.push(v),Re.enabled===!0&&Re.isPresenting===!0){let e=S.xr.getDepthSensingMesh();e!==null&&Ze(e,t,-1/0,S.sortObjects)}Ze(e,t,0,S.sortObjects),v.finish(),S.sortObjects===!0&&v.sort(F,I),ue=Re.enabled===!1||Re.isPresenting===!1||Re.hasDepthSensing()===!1,ue&&Oe.addToRenderList(v,e),this.info.render.frame++,R===!0&&Ee.beginShadows();let n=y.state.shadowsArray;De.render(n,e,t),R===!0&&Ee.endShadows(),this.info.autoReset===!0&&this.info.reset();let r=v.opaque,i=v.transmissive;if(y.setupLights(),t.isArrayCamera){let n=t.cameras;if(i.length>0)for(let t=0,a=n.length;t<a;t++){let a=n[t];$e(r,i,e,a)}ue&&Oe.render(e);for(let t=0,r=n.length;t<r;t++){let r=n[t];Qe(v,e,r,r.viewport)}}else i.length>0&&$e(r,i,e,t),ue&&Oe.render(e),Qe(v,e,t);E!==null&&T===0&&(ge.updateMultisampleRenderTarget(E),ge.updateRenderTargetMipmap(E)),e.isScene===!0&&e.onAfterRender(S,e,t),Fe.resetDefaultState(),D=-1,ee=null,x.pop(),x.length>0?(y=x[x.length-1],R===!0&&Ee.setGlobalState(S.clippingPlanes,y.state.camera)):y=null,b.pop(),v=b.length>0?b[b.length-1]:null};function Ze(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)y.pushLight(e),e.castShadow&&y.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||ie.intersectsSprite(e)){r&&ce.setFromMatrixPosition(e.matrixWorld).applyMatrix4(oe);let t=xe.update(e),i=e.material;i.visible&&v.push(e,t,i,n,ce.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||ie.intersectsObject(e))){let t=xe.update(e),i=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),ce.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),ce.copy(e.boundingSphere.center)),ce.applyMatrix4(e.matrixWorld).applyMatrix4(oe)),Array.isArray(i)){let r=t.groups;for(let a=0,o=r.length;a<o;a++){let o=r[a],s=i[o.materialIndex];s&&s.visible&&v.push(e,t,s,n,ce.z,o)}}else i.visible&&v.push(e,t,i,n,ce.z,null)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)Ze(i[e],t,n,r)}function Qe(e,t,n,r){let i=e.opaque,a=e.transmissive,o=e.transparent;y.setupLightsView(n),R===!0&&Ee.setGlobalState(S.clippingPlanes,n),r&&B.viewport(O.copy(r)),i.length>0&&et(i,t,n),a.length>0&&et(a,t,n),o.length>0&&et(o,t,n),B.buffers.depth.setTest(!0),B.buffers.depth.setMask(!0),B.buffers.color.setMask(!0),B.setPolygonOffset(!1)}function $e(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;y.state.transmissionRenderTarget[r.id]===void 0&&(y.state.transmissionRenderTarget[r.id]=new zt(1,1,{generateMipmaps:!0,type:pe.has(`EXT_color_buffer_half_float`)||pe.has(`EXT_color_buffer_float`)?_:u,minFilter:l,samples:4,stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Dt.workingColorSpace}));let a=y.state.transmissionRenderTarget[r.id],o=r.viewport||O;a.setSize(o.z*S.transmissionResolutionScale,o.w*S.transmissionResolutionScale);let s=S.getRenderTarget(),c=S.getActiveCubeFace(),d=S.getActiveMipmapLevel();S.setRenderTarget(a),S.getClearColor(te),j=S.getClearAlpha(),j<1&&S.setClearColor(16777215,.5),S.clear(),ue&&Oe.render(n);let f=S.toneMapping;S.toneMapping=0;let p=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),y.setupLightsView(r),R===!0&&Ee.setGlobalState(S.clippingPlanes,r),et(e,n,r),ge.updateMultisampleRenderTarget(a),ge.updateRenderTargetMipmap(a),pe.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let a=t[i],o=a.object,s=a.geometry,c=a.material,l=a.group;if(c.side===2&&o.layers.test(r.layers)){let t=c.side;c.side=1,c.needsUpdate=!0,tt(o,n,r,s,c,l),c.side=t,c.needsUpdate=!0,e=!0}}e===!0&&(ge.updateMultisampleRenderTarget(a),ge.updateRenderTargetMipmap(a))}S.setRenderTarget(s,c,d),S.setClearColor(te,j),p!==void 0&&(r.viewport=p),S.toneMapping=f}function et(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],o=a.object,s=a.geometry,c=a.group,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&tt(o,t,n,s,l,c)}}function tt(e,t,n,r,i,a){e.onBeforeRender(S,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(S,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,S.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,S.renderBufferDirect(n,t,r,i,e,a),i.side=2):S.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(S,t,n,r,i,a)}function nt(e,t,n){t.isScene!==!0&&(t=le);let r=V.get(e),i=y.state.lights,a=y.state.shadowsArray,o=i.state.version,s=Se.getParameters(e,i.state,a,t,n),c=Se.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial?t.environment:null,r.fog=t.fog,r.envMap=(e.isMeshStandardMaterial?ve:_e).get(e.envMap||r.environment),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,Ue),l=new Map,r.programs=l);let u=l.get(c);if(u!==void 0){if(r.currentProgram===u&&r.lightsStateVersion===o)return it(e,s),u}else s.uniforms=Se.getUniforms(e),e.onBeforeCompile(s,S),u=Se.acquireProgram(s,c),l.set(c,u),r.uniforms=s.uniforms;let d=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(d.clippingPlanes=Ee.uniform),it(e,s),r.needsLights=st(e),r.lightsStateVersion=o,r.needsLights&&(d.ambientLightColor.value=i.state.ambient,d.lightProbe.value=i.state.probe,d.directionalLights.value=i.state.directional,d.directionalLightShadows.value=i.state.directionalShadow,d.spotLights.value=i.state.spot,d.spotLightShadows.value=i.state.spotShadow,d.rectAreaLights.value=i.state.rectArea,d.ltc_1.value=i.state.rectAreaLTC1,d.ltc_2.value=i.state.rectAreaLTC2,d.pointLights.value=i.state.point,d.pointLightShadows.value=i.state.pointShadow,d.hemisphereLights.value=i.state.hemi,d.directionalShadowMap.value=i.state.directionalShadowMap,d.directionalShadowMatrix.value=i.state.directionalShadowMatrix,d.spotShadowMap.value=i.state.spotShadowMap,d.spotLightMatrix.value=i.state.spotLightMatrix,d.spotLightMap.value=i.state.spotLightMap,d.pointShadowMap.value=i.state.pointShadowMap,d.pointShadowMatrix.value=i.state.pointShadowMatrix),r.currentProgram=u,r.uniformsList=null,u}function rt(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Nc.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function it(e,t){let n=V.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function at(e,t,n,r,i){t.isScene!==!0&&(t=le),ge.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial?t.environment:null,s=E===null?S.outputColorSpace:E.isXRRenderTarget===!0?E.texture.colorSpace:Ne,c=(r.isMeshStandardMaterial?ve:_e).get(r.envMap||o),l=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,u=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),d=!!n.morphAttributes.position,f=!!n.morphAttributes.normal,p=!!n.morphAttributes.color,m=0;r.toneMapped&&(E===null||E.isXRRenderTarget===!0)&&(m=S.toneMapping);let h=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,g=h===void 0?0:h.length,_=V.get(r),v=y.state.lights;if(R===!0&&(ae===!0||e!==ee)){let t=e===ee&&r.id===D;Ee.setState(r,e,t)}let b=!1;r.version===_.__version?_.needsLights&&_.lightsStateVersion!==v.state.version?b=!0:_.outputColorSpace===s?i.isBatchedMesh&&_.batching===!1||!i.isBatchedMesh&&_.batching===!0||i.isBatchedMesh&&_.batchingColor===!0&&i.colorTexture===null||i.isBatchedMesh&&_.batchingColor===!1&&i.colorTexture!==null||i.isInstancedMesh&&_.instancing===!1||!i.isInstancedMesh&&_.instancing===!0||i.isSkinnedMesh&&_.skinning===!1||!i.isSkinnedMesh&&_.skinning===!0||i.isInstancedMesh&&_.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&_.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&_.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&_.instancingMorph===!1&&i.morphTexture!==null?b=!0:_.envMap===c?r.fog===!0&&_.fog!==a||_.numClippingPlanes!==void 0&&(_.numClippingPlanes!==Ee.numPlanes||_.numIntersection!==Ee.numIntersection)?b=!0:_.vertexAlphas===l&&_.vertexTangents===u&&_.morphTargets===d&&_.morphNormals===f&&_.morphColors===p&&_.toneMapping===m?_.morphTargetsCount!==g&&(b=!0):b=!0:b=!0:b=!0:(b=!0,_.__version=r.version);let x=_.currentProgram;b===!0&&(x=nt(r,t,i));let C=!1,w=!1,T=!1,O=x.getUniforms(),k=_.uniforms;if(B.useProgram(x.program)&&(C=!0,w=!0,T=!0),r.id!==D&&(D=r.id,w=!0),C||ee!==e){B.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),O.setValue(z,`projectionMatrix`,e.projectionMatrix),O.setValue(z,`viewMatrix`,e.matrixWorldInverse);let t=O.map.cameraPosition;t!==void 0&&t.setValue(z,se.setFromMatrixPosition(e.matrixWorld)),me.logarithmicDepthBuffer&&O.setValue(z,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&O.setValue(z,`isOrthographic`,e.isOrthographicCamera===!0),ee!==e&&(ee=e,w=!0,T=!0)}if(i.isSkinnedMesh){O.setOptional(z,i,`bindMatrix`),O.setOptional(z,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),O.setValue(z,`boneTexture`,e.boneTexture,ge))}i.isBatchedMesh&&(O.setOptional(z,i,`batchingTexture`),O.setValue(z,`batchingTexture`,i._matricesTexture,ge),O.setOptional(z,i,`batchingIdTexture`),O.setValue(z,`batchingIdTexture`,i._indirectTexture,ge),O.setOptional(z,i,`batchingColorTexture`),i._colorsTexture!==null&&O.setValue(z,`batchingColorTexture`,i._colorsTexture,ge));let A=n.morphAttributes;if((A.position!==void 0||A.normal!==void 0||A.color!==void 0)&&ke.update(i,n,x),(w||_.receiveShadow!==i.receiveShadow)&&(_.receiveShadow=i.receiveShadow,O.setValue(z,`receiveShadow`,i.receiveShadow)),r.isMeshGouraudMaterial&&r.envMap!==null&&(k.envMap.value=c,k.flipEnvMap.value=c.isCubeTexture&&c.isRenderTargetTexture===!1?-1:1),r.isMeshStandardMaterial&&r.envMap===null&&t.environment!==null&&(k.envMapIntensity.value=t.environmentIntensity),w&&(O.setValue(z,`toneMappingExposure`,S.toneMappingExposure),_.needsLights&&ot(k,T),a&&r.fog===!0&&Ce.refreshFogUniforms(k,a),Ce.refreshMaterialUniforms(k,r,P,N,y.state.transmissionRenderTarget[e.id]),Nc.upload(z,rt(_),k,ge)),r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Nc.upload(z,rt(_),k,ge),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&O.setValue(z,`center`,i.center),O.setValue(z,`modelViewMatrix`,i.modelViewMatrix),O.setValue(z,`normalMatrix`,i.normalMatrix),O.setValue(z,`modelMatrix`,i.matrixWorld),r.isShaderMaterial||r.isRawShaderMaterial){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];Ie.update(n,x),Ie.bind(n,x)}}return x}function ot(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function st(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return w},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return E},this.setRenderTargetTextures=function(e,t,n){let r=V.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),V.get(e.texture).__webglTexture=t,V.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=V.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0};let ct=z.createFramebuffer();this.setRenderTarget=function(e,t=0,n=0){E=e,w=t,T=n;let r=!0,i=null,a=!1,o=!1;if(e){let s=V.get(e);if(s.__useDefaultFramebuffer!==void 0)B.bindFramebuffer(z.FRAMEBUFFER,null),r=!1;else if(s.__webglFramebuffer===void 0)ge.setupRenderTarget(e);else if(s.__hasExternalTextures)ge.rebindTextures(e,V.get(e.texture).__webglTexture,V.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(s.__boundDepthTexture!==t){if(t!==null&&V.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.`);ge.setupDepthRenderbuffer(e)}}let c=e.texture;(c.isData3DTexture||c.isDataArrayTexture||c.isCompressedArrayTexture)&&(o=!0);let l=V.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(i=Array.isArray(l[t])?l[t][n]:l[t],a=!0):i=e.samples>0&&ge.useMultisampledRTT(e)===!1?V.get(e).__webglMultisampledFramebuffer:Array.isArray(l)?l[n]:l,O.copy(e.viewport),k.copy(e.scissor),A=e.scissorTest}else O.copy(L).multiplyScalar(P).floor(),k.copy(ne).multiplyScalar(P).floor(),A=re;if(n!==0&&(i=ct),B.bindFramebuffer(z.FRAMEBUFFER,i)&&r&&B.drawBuffers(e,i),B.viewport(O),B.scissor(k),B.setScissorTest(A),a){let r=V.get(e.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(o){let r=t;for(let t=0;t<e.textures.length;t++){let i=V.get(e.textures[t]);z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=V.get(e.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,t.__webglTexture,n)}D=-1},this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=V.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){B.bindFramebuffer(z.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;if(!me.textureFormatReadable(c)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!me.textureTypeReadable(l)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&(e.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+s),z.readPixels(t,n,r,i,Pe.convert(c),Pe.convert(l),a))}finally{let e=E===null?null:V.get(E).__webglFramebuffer;B.bindFramebuffer(z.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=V.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){B.bindFramebuffer(z.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;if(!me.textureFormatReadable(l))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!me.textureTypeReadable(u))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let d=z.createBuffer();z.bindBuffer(z.PIXEL_PACK_BUFFER,d),z.bufferData(z.PIXEL_PACK_BUFFER,a.byteLength,z.STREAM_READ),e.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+s),z.readPixels(t,n,r,i,Pe.convert(l),Pe.convert(u),0);let f=E===null?null:V.get(E).__webglFramebuffer;B.bindFramebuffer(z.FRAMEBUFFER,f);let p=z.fenceSync(z.SYNC_GPU_COMMANDS_COMPLETE,0);return z.flush(),await Ct(z,p,4),z.bindBuffer(z.PIXEL_PACK_BUFFER,d),z.getBufferSubData(z.PIXEL_PACK_BUFFER,0,a),z.deleteBuffer(d),z.deleteSync(p),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;ge.setTexture2D(e,0),z.copyTexSubImage2D(z.TEXTURE_2D,n,0,0,o,s,i,a),B.unbindTexture()};let lt=z.createFramebuffer(),ut=z.createFramebuffer();this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=null){a===null&&(i===0?a=0:(St(`WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels.`),a=i,i=0));let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Pe.convert(t.format),_=Pe.convert(t.type),v;t.isData3DTexture?(ge.setTexture3D(t,0),v=z.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(ge.setTexture2DArray(t,0),v=z.TEXTURE_2D_ARRAY):(ge.setTexture2D(t,0),v=z.TEXTURE_2D),z.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,t.flipY),z.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),z.pixelStorei(z.UNPACK_ALIGNMENT,t.unpackAlignment);let y=z.getParameter(z.UNPACK_ROW_LENGTH),b=z.getParameter(z.UNPACK_IMAGE_HEIGHT),x=z.getParameter(z.UNPACK_SKIP_PIXELS),S=z.getParameter(z.UNPACK_SKIP_ROWS),C=z.getParameter(z.UNPACK_SKIP_IMAGES);z.pixelStorei(z.UNPACK_ROW_LENGTH,h.width),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,h.height),z.pixelStorei(z.UNPACK_SKIP_PIXELS,l),z.pixelStorei(z.UNPACK_SKIP_ROWS,u),z.pixelStorei(z.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=V.get(e),r=V.get(t),h=V.get(n.__renderTarget),g=V.get(r.__renderTarget);B.bindFramebuffer(z.READ_FRAMEBUFFER,h.__webglFramebuffer),B.bindFramebuffer(z.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,V.get(e).__webglTexture,i,d+n),z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,V.get(t).__webglTexture,a,m+n)),z.blitFramebuffer(l,u,o,s,f,p,o,s,z.DEPTH_BUFFER_BIT,z.NEAREST);B.bindFramebuffer(z.READ_FRAMEBUFFER,null),B.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||V.has(e)){let n=V.get(e),r=V.get(t);B.bindFramebuffer(z.READ_FRAMEBUFFER,lt),B.bindFramebuffer(z.DRAW_FRAMEBUFFER,ut);for(let e=0;e<c;e++)w?z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):z.framebufferTexture2D(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,n.__webglTexture,i),T?z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):z.framebufferTexture2D(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,r.__webglTexture,a),i===0?T?z.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):z.copyTexSubImage2D(v,a,f,p,l,u,o,s):z.blitFramebuffer(l,u,o,s,f,p,o,s,z.COLOR_BUFFER_BIT,z.NEAREST);B.bindFramebuffer(z.READ_FRAMEBUFFER,null),B.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?z.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?z.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):z.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):z.texSubImage2D(z.TEXTURE_2D,a,f,p,o,s,g,_,h);z.pixelStorei(z.UNPACK_ROW_LENGTH,y),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,b),z.pixelStorei(z.UNPACK_SKIP_PIXELS,x),z.pixelStorei(z.UNPACK_SKIP_ROWS,S),z.pixelStorei(z.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&z.generateMipmap(v),B.unbindTexture()},this.initRenderTarget=function(e){V.get(e).__webglFramebuffer===void 0&&ge.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?ge.setTextureCube(e,0):e.isData3DTexture?ge.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?ge.setTexture2DArray(e,0):ge.setTexture2D(e,0),B.unbindTexture()},this.resetState=function(){w=0,T=0,E=null,B.reset(),Fe.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return Be}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Dt._getDrawingBufferColorSpace(e),t.unpackColorSpace=Dt._getUnpackColorSpace()}};function Ul(e,t=!1){let n=e[0].index!==null,r=new Set(Object.keys(e[0].attributes)),i=new Set(Object.keys(e[0].morphAttributes)),a={},o={},s=e[0].morphTargetsRelative,c=new Ar,l=0;for(let u=0;u<e.length;++u){let d=e[u],f=0;if(n!==(d.index!==null))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.`),null;for(let e in d.attributes){if(!r.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure "`+e+`" attribute exists among all geometries, or in none of them.`),null;a[e]===void 0&&(a[e]=[]),a[e].push(d.attributes[e]),f++}if(f!==r.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of attributes.`),null;if(s!==d.morphTargetsRelative)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. .morphTargetsRelative must be consistent throughout all geometries.`),null;for(let e in d.morphAttributes){if(!i.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`.  .morphAttributes must be consistent throughout all geometries.`),null;o[e]===void 0&&(o[e]=[]),o[e].push(d.morphAttributes[e])}if(t){let e;if(n)e=d.index.count;else if(d.attributes.position!==void 0)e=d.attributes.position.count;else return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. The geometry must have either an index or a position attribute`),null;c.addGroup(l,e,u),l+=e}}if(n){let t=0,n=[];for(let r=0;r<e.length;++r){let i=e[r].index;for(let e=0;e<i.count;++e)n.push(i.getX(e)+t);t+=e[r].attributes.position.count}c.setIndex(n)}for(let e in a){let t=Wl(a[e]);if(!t)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` attribute.`),null;c.setAttribute(e,t)}for(let e in o){let t=o[e][0].length;if(t===0)break;c.morphAttributes=c.morphAttributes||{},c.morphAttributes[e]=[];for(let n=0;n<t;++n){let t=[];for(let r=0;r<o[e].length;++r)t.push(o[e][r][n]);let r=Wl(t);if(!r)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` morphAttribute.`),null;c.morphAttributes[e].push(r)}}return c}function Wl(e){let t,n,r,i=-1,a=0;for(let o=0;o<e.length;++o){let s=e[o];if(t===void 0&&(t=s.array.constructor),t!==s.array.constructor)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.`),null;if(n===void 0&&(n=s.itemSize),n!==s.itemSize)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.`),null;if(r===void 0&&(r=s.normalized),r!==s.normalized)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.`),null;if(i===-1&&(i=s.gpuType),i!==s.gpuType)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.`),null;a+=s.count*n}let o=new t(a),s=new yr(o,n,r),c=0;for(let t=0;t<e.length;++t){let r=e[t];if(r.isInterleavedBufferAttribute){let e=c/n;for(let t=0,i=r.count;t<i;t++)for(let i=0;i<n;i++){let n=r.getComponent(t,i);s.setComponent(t+e,i,n)}}else o.set(r.array,c);c+=r.count*n}return i!==void 0&&(s.gpuType=i),s}function Gl(e,t){if(t===0)return console.warn(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.`),e;if(t===2||t===1){let n=e.getIndex();if(n===null){let t=[],r=e.getAttribute(`position`);if(r!==void 0){for(let e=0;e<r.count;e++)t.push(e);e.setIndex(t),n=e.getIndex()}else return console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.`),e}let r=n.count-2,i=[];if(t===2)for(let e=1;e<=r;e++)i.push(n.getX(0)),i.push(n.getX(e)),i.push(n.getX(e+1));else for(let e=0;e<r;e++)e%2==0?(i.push(n.getX(e)),i.push(n.getX(e+1)),i.push(n.getX(e+2))):(i.push(n.getX(e+2)),i.push(n.getX(e+1)),i.push(n.getX(e)));i.length/3!==r&&console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.`);let a=e.clone();return a.setIndex(i),a.clearGroups(),a}return console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:`,t),e}var Kl=class extends Xa{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(e){return new Zl(e)}),this.register(function(e){return new Ql(e)}),this.register(function(e){return new su(e)}),this.register(function(e){return new cu(e)}),this.register(function(e){return new lu(e)}),this.register(function(e){return new eu(e)}),this.register(function(e){return new tu(e)}),this.register(function(e){return new nu(e)}),this.register(function(e){return new ru(e)}),this.register(function(e){return new Xl(e)}),this.register(function(e){return new iu(e)}),this.register(function(e){return new $l(e)}),this.register(function(e){return new ou(e)}),this.register(function(e){return new au(e)}),this.register(function(e){return new Jl(e)}),this.register(function(e){return new uu(e)}),this.register(function(e){return new du(e)})}load(e,t,n,r){let i=this,a;if(this.resourcePath!==``)a=this.resourcePath;else if(this.path!==``){let t=yo.extractUrlBase(e);a=yo.resolveURL(t,this.path)}else a=yo.extractUrlBase(e);this.manager.itemStart(e);let o=function(t){r?r(t):console.error(t),i.manager.itemError(e),i.manager.itemEnd(e)},s=new $a(this.manager);s.setPath(this.path),s.setResponseType(`arraybuffer`),s.setRequestHeader(this.requestHeader),s.setWithCredentials(this.withCredentials),s.load(e,function(n){try{i.parse(n,a,function(n){t(n),i.manager.itemEnd(e)},o)}catch(e){o(e)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,r){let i,a={},o={},s=new TextDecoder;if(typeof e==`string`)i=JSON.parse(e);else if(e instanceof ArrayBuffer){if(s.decode(new Uint8Array(e,0,4))===fu){try{a[Z.KHR_BINARY_GLTF]=new hu(e)}catch(e){r&&r(e);return}i=JSON.parse(a[Z.KHR_BINARY_GLTF].content)}else i=JSON.parse(s.decode(e))}else i=e;if(i.asset===void 0||i.asset.version[0]<2){r&&r(Error(`THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.`));return}let c=new Vu(i,{path:t||this.resourcePath||``,crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let e=0;e<this.pluginCallbacks.length;e++){let t=this.pluginCallbacks[e](c);t.name||console.error(`THREE.GLTFLoader: Invalid plugin found: missing name`),o[t.name]=t,a[t.name]=!0}if(i.extensionsUsed)for(let e=0;e<i.extensionsUsed.length;++e){let t=i.extensionsUsed[e],n=i.extensionsRequired||[];switch(t){case Z.KHR_MATERIALS_UNLIT:a[t]=new Yl;break;case Z.KHR_DRACO_MESH_COMPRESSION:a[t]=new gu(i,this.dracoLoader);break;case Z.KHR_TEXTURE_TRANSFORM:a[t]=new _u;break;case Z.KHR_MESH_QUANTIZATION:a[t]=new vu;break;default:n.indexOf(t)>=0&&o[t]===void 0&&console.warn(`THREE.GLTFLoader: Unknown extension "`+t+`".`)}}c.setExtensions(a),c.setPlugins(o),c.parse(n,r)}parseAsync(e,t){let n=this;return new Promise(function(r,i){n.parse(e,t,r,i)})}};function ql(){let e={};return{get:function(t){return e[t]},add:function(t,n){e[t]=n},remove:function(t){delete e[t]},removeAll:function(){e={}}}}var Z={KHR_BINARY_GLTF:`KHR_binary_glTF`,KHR_DRACO_MESH_COMPRESSION:`KHR_draco_mesh_compression`,KHR_LIGHTS_PUNCTUAL:`KHR_lights_punctual`,KHR_MATERIALS_CLEARCOAT:`KHR_materials_clearcoat`,KHR_MATERIALS_DISPERSION:`KHR_materials_dispersion`,KHR_MATERIALS_IOR:`KHR_materials_ior`,KHR_MATERIALS_SHEEN:`KHR_materials_sheen`,KHR_MATERIALS_SPECULAR:`KHR_materials_specular`,KHR_MATERIALS_TRANSMISSION:`KHR_materials_transmission`,KHR_MATERIALS_IRIDESCENCE:`KHR_materials_iridescence`,KHR_MATERIALS_ANISOTROPY:`KHR_materials_anisotropy`,KHR_MATERIALS_UNLIT:`KHR_materials_unlit`,KHR_MATERIALS_VOLUME:`KHR_materials_volume`,KHR_TEXTURE_BASISU:`KHR_texture_basisu`,KHR_TEXTURE_TRANSFORM:`KHR_texture_transform`,KHR_MESH_QUANTIZATION:`KHR_mesh_quantization`,KHR_MATERIALS_EMISSIVE_STRENGTH:`KHR_materials_emissive_strength`,EXT_MATERIALS_BUMP:`EXT_materials_bump`,EXT_TEXTURE_WEBP:`EXT_texture_webp`,EXT_TEXTURE_AVIF:`EXT_texture_avif`,EXT_MESHOPT_COMPRESSION:`EXT_meshopt_compression`,EXT_MESH_GPU_INSTANCING:`EXT_mesh_gpu_instancing`},Jl=class{constructor(e){this.parser=e,this.name=Z.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,r=t.length;n<r;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n=`light:`+e,r=t.cache.get(n);if(r)return r;let i=t.json,a=((i.extensions&&i.extensions[this.name]||{}).lights||[])[e],o,s=new J(16777215);a.color!==void 0&&s.setRGB(a.color[0],a.color[1],a.color[2],Ne);let c=a.range===void 0?0:a.range;switch(a.type){case`directional`:o=new vo(s),o.target.position.set(0,0,-1),o.add(o.target);break;case`point`:o=new ho(s),o.distance=c;break;case`spot`:o=new lo(s),o.distance=c,a.spot=a.spot||{},a.spot.innerConeAngle=a.spot.innerConeAngle===void 0?0:a.spot.innerConeAngle,a.spot.outerConeAngle=a.spot.outerConeAngle===void 0?Math.PI/4:a.spot.outerConeAngle,o.angle=a.spot.outerConeAngle,o.penumbra=1-a.spot.innerConeAngle/a.spot.outerConeAngle,o.target.position.set(0,0,-1),o.add(o.target);break;default:throw Error(`THREE.GLTFLoader: Unexpected light type: `+a.type)}return o.position.set(0,0,0),Nu(o,a),a.intensity!==void 0&&(o.intensity=a.intensity),o.name=t.createUniqueName(a.name||`light_`+e),r=Promise.resolve(o),t.cache.add(n,r),r}getDependency(e,t){if(e===`light`)return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],i=(r.extensions&&r.extensions[this.name]||{}).light;return i===void 0?null:this._loadLight(i).then(function(e){return n._getNodeRef(t.cache,i,e)})}},Yl=class{constructor(){this.name=Z.KHR_MATERIALS_UNLIT}getMaterialType(){return ur}extendParams(e,t,n){let r=[];e.color=new J(1,1,1),e.opacity=1;let i=t.pbrMetallicRoughness;if(i){if(Array.isArray(i.baseColorFactor)){let t=i.baseColorFactor;e.color.setRGB(t[0],t[1],t[2],Ne),e.opacity=t[3]}i.baseColorTexture!==void 0&&r.push(n.assignTexture(e,`map`,i.baseColorTexture,Me))}return Promise.all(r)}},Xl=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();let r=n.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}},Zl=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Ta}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];if(a.clearcoatFactor!==void 0&&(t.clearcoat=a.clearcoatFactor),a.clearcoatTexture!==void 0&&i.push(n.assignTexture(t,`clearcoatMap`,a.clearcoatTexture)),a.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),a.clearcoatRoughnessTexture!==void 0&&i.push(n.assignTexture(t,`clearcoatRoughnessMap`,a.clearcoatRoughnessTexture)),a.clearcoatNormalTexture!==void 0&&(i.push(n.assignTexture(t,`clearcoatNormalMap`,a.clearcoatNormalTexture)),a.clearcoatNormalTexture.scale!==void 0)){let e=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new U(e,e)}return Promise.all(i)}},Ql=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_DISPERSION}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Ta}extendMaterialParams(e,t){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();let r=n.extensions[this.name];return t.dispersion=r.dispersion===void 0?0:r.dispersion,Promise.resolve()}},$l=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Ta}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];return a.iridescenceFactor!==void 0&&(t.iridescence=a.iridescenceFactor),a.iridescenceTexture!==void 0&&i.push(n.assignTexture(t,`iridescenceMap`,a.iridescenceTexture)),a.iridescenceIor!==void 0&&(t.iridescenceIOR=a.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),a.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=a.iridescenceThicknessMinimum),a.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=a.iridescenceThicknessMaximum),a.iridescenceThicknessTexture!==void 0&&i.push(n.assignTexture(t,`iridescenceThicknessMap`,a.iridescenceThicknessTexture)),Promise.all(i)}},eu=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_SHEEN}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Ta}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[];t.sheenColor=new J(0,0,0),t.sheenRoughness=0,t.sheen=1;let a=r.extensions[this.name];if(a.sheenColorFactor!==void 0){let e=a.sheenColorFactor;t.sheenColor.setRGB(e[0],e[1],e[2],Ne)}return a.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=a.sheenRoughnessFactor),a.sheenColorTexture!==void 0&&i.push(n.assignTexture(t,`sheenColorMap`,a.sheenColorTexture,Me)),a.sheenRoughnessTexture!==void 0&&i.push(n.assignTexture(t,`sheenRoughnessMap`,a.sheenRoughnessTexture)),Promise.all(i)}},tu=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Ta}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];return a.transmissionFactor!==void 0&&(t.transmission=a.transmissionFactor),a.transmissionTexture!==void 0&&i.push(n.assignTexture(t,`transmissionMap`,a.transmissionTexture)),Promise.all(i)}},nu=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_VOLUME}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Ta}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];t.thickness=a.thicknessFactor===void 0?0:a.thicknessFactor,a.thicknessTexture!==void 0&&i.push(n.assignTexture(t,`thicknessMap`,a.thicknessTexture)),t.attenuationDistance=a.attenuationDistance||1/0;let o=a.attenuationColor||[1,1,1];return t.attenuationColor=new J().setRGB(o[0],o[1],o[2],Ne),Promise.all(i)}},ru=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_IOR}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Ta}extendMaterialParams(e,t){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();let r=n.extensions[this.name];return t.ior=r.ior===void 0?1.5:r.ior,Promise.resolve()}},iu=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_SPECULAR}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Ta}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];t.specularIntensity=a.specularFactor===void 0?1:a.specularFactor,a.specularTexture!==void 0&&i.push(n.assignTexture(t,`specularIntensityMap`,a.specularTexture));let o=a.specularColorFactor||[1,1,1];return t.specularColor=new J().setRGB(o[0],o[1],o[2],Ne),a.specularColorTexture!==void 0&&i.push(n.assignTexture(t,`specularColorMap`,a.specularColorTexture,Me)),Promise.all(i)}},au=class{constructor(e){this.parser=e,this.name=Z.EXT_MATERIALS_BUMP}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Ta}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];return t.bumpScale=a.bumpFactor===void 0?1:a.bumpFactor,a.bumpTexture!==void 0&&i.push(n.assignTexture(t,`bumpMap`,a.bumpTexture)),Promise.all(i)}},ou=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Ta}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];return a.anisotropyStrength!==void 0&&(t.anisotropy=a.anisotropyStrength),a.anisotropyRotation!==void 0&&(t.anisotropyRotation=a.anisotropyRotation),a.anisotropyTexture!==void 0&&i.push(n.assignTexture(t,`anisotropyMap`,a.anisotropyTexture)),Promise.all(i)}},su=class{constructor(e){this.parser=e,this.name=Z.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,r=n.textures[e];if(!r.extensions||!r.extensions[this.name])return null;let i=r.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw Error(`THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures`);return null}return t.loadTextureImage(e,i.source,a)}},cu=class{constructor(e){this.parser=e,this.name=Z.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,r=n.json,i=r.textures[e];if(!i.extensions||!i.extensions[t])return null;let a=i.extensions[t],o=r.images[a.source],s=n.textureLoader;if(o.uri){let e=n.options.manager.getHandler(o.uri);e!==null&&(s=e)}return n.loadTextureImage(e,a.source,s)}},lu=class{constructor(e){this.parser=e,this.name=Z.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,r=n.json,i=r.textures[e];if(!i.extensions||!i.extensions[t])return null;let a=i.extensions[t],o=r.images[a.source],s=n.textureLoader;if(o.uri){let e=n.options.manager.getHandler(o.uri);e!==null&&(s=e)}return n.loadTextureImage(e,a.source,s)}},uu=class{constructor(e){this.name=Z.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let e=n.extensions[this.name],r=this.parser.getDependency(`buffer`,e.buffer),i=this.parser.options.meshoptDecoder;if(!i||!i.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw Error(`THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files`);return null}return r.then(function(t){let n=e.byteOffset||0,r=e.byteLength||0,a=e.count,o=e.byteStride,s=new Uint8Array(t,n,r);return i.decodeGltfBufferAsync?i.decodeGltfBufferAsync(a,o,s,e.mode,e.filter).then(function(e){return e.buffer}):i.ready.then(function(){let t=new ArrayBuffer(a*o);return i.decodeGltfBuffer(new Uint8Array(t),a,o,s,e.mode,e.filter),t})})}return null}},du=class{constructor(e){this.name=Z.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let r=t.meshes[n.mesh];for(let e of r.primitives)if(e.mode!==Su.TRIANGLES&&e.mode!==Su.TRIANGLE_STRIP&&e.mode!==Su.TRIANGLE_FAN&&e.mode!==void 0)return null;let i=n.extensions[this.name].attributes,a=[],o={};for(let e in i)a.push(this.parser.getDependency(`accessor`,i[e]).then(t=>(o[e]=t,o[e])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(e=>{let t=e.pop(),n=t.isGroup?t.children:[t],r=e[0].count,i=[];for(let e of n){let t=new q,n=new W,a=new mt,s=new W(1,1,1),c=new Bi(e.geometry,e.material,r);for(let e=0;e<r;e++)o.TRANSLATION&&n.fromBufferAttribute(o.TRANSLATION,e),o.ROTATION&&a.fromBufferAttribute(o.ROTATION,e),o.SCALE&&s.fromBufferAttribute(o.SCALE,e),c.setMatrixAt(e,t.compose(n,a,s));for(let t in o)if(t===`_COLOR_0`){let e=o[t];c.instanceColor=new Mi(e.array,e.itemSize,e.normalized)}else t!==`TRANSLATION`&&t!==`ROTATION`&&t!==`SCALE`&&e.geometry.setAttribute(t,o[t]);Hn.prototype.copy.call(c,e),this.parser.assignFinalMaterial(c),i.push(c)}return t.isGroup?(t.clear(),t.add(...i),t):i[0]}))}},fu=`glTF`,pu=12,mu={JSON:1313821514,BIN:5130562},hu=class{constructor(e){this.name=Z.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,pu),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==fu)throw Error(`THREE.GLTFLoader: Unsupported glTF-Binary header.`);if(this.header.version<2)throw Error(`THREE.GLTFLoader: Legacy binary file detected.`);let r=this.header.length-pu,i=new DataView(e,pu),a=0;for(;a<r;){let t=i.getUint32(a,!0);a+=4;let r=i.getUint32(a,!0);if(a+=4,r===mu.JSON){let r=new Uint8Array(e,pu+a,t);this.content=n.decode(r)}else if(r===mu.BIN){let n=pu+a;this.body=e.slice(n,n+t)}a+=t}if(this.content===null)throw Error(`THREE.GLTFLoader: JSON content not found.`)}},gu=class{constructor(e,t){if(!t)throw Error(`THREE.GLTFLoader: No DRACOLoader instance provided.`);this.name=Z.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,r=this.dracoLoader,i=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},s={},c={};for(let e in a){let t=Du[e]||e.toLowerCase();o[t]=a[e]}for(let t in e.attributes){let r=Du[t]||t.toLowerCase();if(a[t]!==void 0){let i=n.accessors[e.attributes[t]];c[r]=Cu[i.componentType].name,s[r]=i.normalized===!0}}return t.getDependency(`bufferView`,i).then(function(e){return new Promise(function(t,n){r.decodeDracoFile(e,function(e){for(let t in e.attributes){let n=e.attributes[t],r=s[t];r!==void 0&&(n.normalized=r)}t(e)},o,c,Ne,n)})})}},_u=class{constructor(){this.name=Z.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0?e:(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0,e)}},vu=class{constructor(){this.name=Z.KHR_MESH_QUANTIZATION}},yu=class extends Na{constructor(e,t,n,r){super(e,t,n,r)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r*3+r;for(let e=0;e!==r;e++)t[e]=n[i+e];return t}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=o*2,c=o*3,l=r-t,u=(n-t)/l,d=u*u,f=d*u,p=e*c,m=p-c,h=-2*f+3*d,g=f-d,_=1-h,v=g-d+u;for(let e=0;e!==o;e++){let t=a[m+e+o],n=a[m+e+s]*l,r=a[p+e+o],c=a[p+e]*l;i[e]=_*t+v*n+h*r+g*c}return i}},bu=new mt,xu=class extends yu{interpolate_(e,t,n,r){let i=super.interpolate_(e,t,n,r);return bu.fromArray(i).normalize().toArray(i),i}},Su={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},Cu={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},wu={9728:i,9729:s,9984:a,9985:c,9986:o,9987:l},Tu={33071:n,33648:r,10497:t},Eu={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Du={POSITION:`position`,NORMAL:`normal`,TANGENT:`tangent`,TEXCOORD_0:`uv`,TEXCOORD_1:`uv1`,TEXCOORD_2:`uv2`,TEXCOORD_3:`uv3`,COLOR_0:`color`,WEIGHTS_0:`skinWeight`,JOINTS_0:`skinIndex`},Ou={scale:`scale`,translation:`position`,rotation:`quaternion`,weights:`morphTargetInfluences`},ku={CUBICSPLINE:void 0,LINEAR:we,STEP:Ce},Au={OPAQUE:`OPAQUE`,MASK:`MASK`,BLEND:`BLEND`};function ju(e){return e.DefaultMaterial===void 0&&(e.DefaultMaterial=new wa({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:0})),e.DefaultMaterial}function Mu(e,t,n){for(let r in n.extensions)e[r]===void 0&&(t.userData.gltfExtensions=t.userData.gltfExtensions||{},t.userData.gltfExtensions[r]=n.extensions[r])}function Nu(e,t){t.extras!==void 0&&(typeof t.extras==`object`?Object.assign(e.userData,t.extras):console.warn(`THREE.GLTFLoader: Ignoring primitive type .extras, `+t.extras))}function Pu(e,t,n){let r=!1,i=!1,a=!1;for(let e=0,n=t.length;e<n;e++){let n=t[e];if(n.POSITION!==void 0&&(r=!0),n.NORMAL!==void 0&&(i=!0),n.COLOR_0!==void 0&&(a=!0),r&&i&&a)break}if(!r&&!i&&!a)return Promise.resolve(e);let o=[],s=[],c=[];for(let l=0,u=t.length;l<u;l++){let u=t[l];if(r){let t=u.POSITION===void 0?e.attributes.position:n.getDependency(`accessor`,u.POSITION);o.push(t)}if(i){let t=u.NORMAL===void 0?e.attributes.normal:n.getDependency(`accessor`,u.NORMAL);s.push(t)}if(a){let t=u.COLOR_0===void 0?e.attributes.color:n.getDependency(`accessor`,u.COLOR_0);c.push(t)}}return Promise.all([Promise.all(o),Promise.all(s),Promise.all(c)]).then(function(t){let n=t[0],o=t[1],s=t[2];return r&&(e.morphAttributes.position=n),i&&(e.morphAttributes.normal=o),a&&(e.morphAttributes.color=s),e.morphTargetsRelative=!0,e})}function Fu(e,t){if(e.updateMorphTargets(),t.weights!==void 0)for(let n=0,r=t.weights.length;n<r;n++)e.morphTargetInfluences[n]=t.weights[n];if(t.extras&&Array.isArray(t.extras.targetNames)){let n=t.extras.targetNames;if(e.morphTargetInfluences.length===n.length){e.morphTargetDictionary={};for(let t=0,r=n.length;t<r;t++)e.morphTargetDictionary[n[t]]=t}else console.warn(`THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.`)}}function Iu(e){let t,n=e.extensions&&e.extensions[Z.KHR_DRACO_MESH_COMPRESSION];if(t=n?`draco:`+n.bufferView+`:`+n.indices+`:`+Lu(n.attributes):e.indices+`:`+Lu(e.attributes)+`:`+e.mode,e.targets!==void 0)for(let n=0,r=e.targets.length;n<r;n++)t+=`:`+Lu(e.targets[n]);return t}function Lu(e){let t=``,n=Object.keys(e).sort();for(let r=0,i=n.length;r<i;r++)t+=n[r]+`:`+e[n[r]]+`;`;return t}function Ru(e){switch(e){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw Error(`THREE.GLTFLoader: Unsupported normalized accessor component type.`)}}function zu(e){return e.search(/\.jpe?g($|\?)/i)>0||e.search(/^data\:image\/jpeg/)===0?`image/jpeg`:e.search(/\.webp($|\?)/i)>0||e.search(/^data\:image\/webp/)===0?`image/webp`:e.search(/\.ktx2($|\?)/i)>0||e.search(/^data\:image\/ktx2/)===0?`image/ktx2`:`image/png`}var Bu=new q,Vu=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new ql,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,r=-1,i=!1,a=-1;if(typeof navigator<`u`){let e=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(e)===!0;let t=e.match(/Version\/(\d+)/);r=n&&t?parseInt(t[1],10):-1,i=e.indexOf(`Firefox`)>-1,a=i?e.match(/Firefox\/([0-9]+)\./)[1]:-1}this.textureLoader=typeof createImageBitmap>`u`||n&&r<17||i&&a<98?new no(this.options.manager):new xo(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new $a(this.options.manager),this.fileLoader.setResponseType(`arraybuffer`),this.options.crossOrigin===`use-credentials`&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,r=this.json,i=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(e){return e._markDefs&&e._markDefs()}),Promise.all(this._invokeAll(function(e){return e.beforeRoot&&e.beforeRoot()})).then(function(){return Promise.all([n.getDependencies(`scene`),n.getDependencies(`animation`),n.getDependencies(`camera`)])}).then(function(t){let a={scene:t[0][r.scene||0],scenes:t[0],animations:t[1],cameras:t[2],asset:r.asset,parser:n,userData:{}};return Mu(i,a,r),Nu(a,r),Promise.all(n._invokeAll(function(e){return e.afterRoot&&e.afterRoot(a)})).then(function(){for(let e of a.scenes)e.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let n=0,r=t.length;n<r;n++){let r=t[n].joints;for(let t=0,n=r.length;t<n;t++)e[r[t]].isBone=!0}for(let t=0,r=e.length;t<r;t++){let r=e[t];r.mesh!==void 0&&(this._addNodeRef(this.meshCache,r.mesh),r.skin!==void 0&&(n[r.mesh].isSkinnedMesh=!0)),r.camera!==void 0&&this._addNodeRef(this.cameraCache,r.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let r=n.clone(),i=(e,t)=>{let n=this.associations.get(e);n!=null&&this.associations.set(t,n);for(let[n,r]of e.children.entries())i(r,t.children[n])};return i(n,r),r.name+=`_instance_`+e.uses[t]++,r}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let r=e(t[n]);if(r)return r}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let r=0;r<t.length;r++){let i=e(t[r]);i&&n.push(i)}return n}getDependency(e,t){let n=e+`:`+t,r=this.cache.get(n);if(!r){switch(e){case`scene`:r=this.loadScene(t);break;case`node`:r=this._invokeOne(function(e){return e.loadNode&&e.loadNode(t)});break;case`mesh`:r=this._invokeOne(function(e){return e.loadMesh&&e.loadMesh(t)});break;case`accessor`:r=this.loadAccessor(t);break;case`bufferView`:r=this._invokeOne(function(e){return e.loadBufferView&&e.loadBufferView(t)});break;case`buffer`:r=this.loadBuffer(t);break;case`material`:r=this._invokeOne(function(e){return e.loadMaterial&&e.loadMaterial(t)});break;case`texture`:r=this._invokeOne(function(e){return e.loadTexture&&e.loadTexture(t)});break;case`skin`:r=this.loadSkin(t);break;case`animation`:r=this._invokeOne(function(e){return e.loadAnimation&&e.loadAnimation(t)});break;case`camera`:r=this.loadCamera(t);break;default:if(r=this._invokeOne(function(n){return n!=this&&n.getDependency&&n.getDependency(e,t)}),!r)throw Error(`Unknown type: `+e)}this.cache.add(n,r)}return r}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,r=this.json[e+(e===`mesh`?`es`:`s`)]||[];t=Promise.all(r.map(function(t,r){return n.getDependency(e,r)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!==`arraybuffer`)throw Error(`THREE.GLTFLoader: `+t.type+` buffer type is not supported.`);if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Z.KHR_BINARY_GLTF].body);let r=this.options;return new Promise(function(e,i){n.load(yo.resolveURL(t.uri,r.path),e,void 0,function(){i(Error(`THREE.GLTFLoader: Failed to load buffer "`+t.uri+`".`))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency(`buffer`,t.buffer).then(function(e){let n=t.byteLength||0,r=t.byteOffset||0;return e.slice(r,r+n)})}loadAccessor(e){let t=this,n=this.json,r=this.json.accessors[e];if(r.bufferView===void 0&&r.sparse===void 0){let e=Eu[r.type],t=Cu[r.componentType],n=r.normalized===!0,i=new t(r.count*e);return Promise.resolve(new yr(i,e,n))}let i=[];return r.bufferView===void 0?i.push(null):i.push(this.getDependency(`bufferView`,r.bufferView)),r.sparse!==void 0&&(i.push(this.getDependency(`bufferView`,r.sparse.indices.bufferView)),i.push(this.getDependency(`bufferView`,r.sparse.values.bufferView))),Promise.all(i).then(function(e){let i=e[0],a=Eu[r.type],o=Cu[r.componentType],s=o.BYTES_PER_ELEMENT,c=s*a,l=r.byteOffset||0,u=r.bufferView===void 0?void 0:n.bufferViews[r.bufferView].byteStride,d=r.normalized===!0,f,p;if(u&&u!==c){let e=Math.floor(l/u),n=`InterleavedBuffer:`+r.bufferView+`:`+r.componentType+`:`+e+`:`+r.count,c=t.cache.get(n);c||(f=new o(i,e*u,r.count*u/s),c=new mi(f,u/s),t.cache.add(n,c)),p=new gi(c,a,l%u/s,d)}else f=i===null?new o(r.count*a):new o(i,l,r.count*a),p=new yr(f,a,d);if(r.sparse!==void 0){let t=Eu.SCALAR,n=Cu[r.sparse.indices.componentType],s=r.sparse.indices.byteOffset||0,c=r.sparse.values.byteOffset||0,l=new n(e[1],s,r.sparse.count*t),u=new o(e[2],c,r.sparse.count*a);i!==null&&(p=new yr(p.array.slice(),p.itemSize,p.normalized)),p.normalized=!1;for(let e=0,t=l.length;e<t;e++){let t=l[e];if(p.setX(t,u[e*a]),a>=2&&p.setY(t,u[e*a+1]),a>=3&&p.setZ(t,u[e*a+2]),a>=4&&p.setW(t,u[e*a+3]),a>=5)throw Error(`THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.`)}p.normalized=d}return p})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,i=t.images[r],a=this.textureLoader;if(i.uri){let e=n.manager.getHandler(i.uri);e!==null&&(a=e)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){let r=this,i=this.json,a=i.textures[e],o=i.images[t],s=(o.uri||o.bufferView)+`:`+a.sampler;if(this.textureCache[s])return this.textureCache[s];let c=this.loadImageSource(t,n).then(function(t){t.flipY=!1,t.name=a.name||o.name||``,t.name===``&&typeof o.uri==`string`&&o.uri.startsWith(`data:image/`)===!1&&(t.name=o.uri);let n=(i.samplers||{})[a.sampler]||{};return t.magFilter=wu[n.magFilter]||1006,t.minFilter=wu[n.minFilter]||1008,t.wrapS=Tu[n.wrapS]||1e3,t.wrapT=Tu[n.wrapT]||1e3,t.generateMipmaps=!t.isCompressedTexture&&t.minFilter!==1003&&t.minFilter!==1006,r.associations.set(t,{textures:e}),t}).catch(function(){return null});return this.textureCache[s]=c,c}loadImageSource(e,t){let n=this,r=this.json,i=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(e=>e.clone());let a=r.images[e],o=self.URL||self.webkitURL,s=a.uri||``,c=!1;if(a.bufferView!==void 0)s=n.getDependency(`bufferView`,a.bufferView).then(function(e){c=!0;let t=new Blob([e],{type:a.mimeType});return s=o.createObjectURL(t),s});else if(a.uri===void 0)throw Error(`THREE.GLTFLoader: Image `+e+` is missing URI and bufferView`);let l=Promise.resolve(s).then(function(e){return new Promise(function(n,r){let a=n;t.isImageBitmapLoader===!0&&(a=function(e){let t=new Lt(e);t.needsUpdate=!0,n(t)}),t.load(yo.resolveURL(e,i.path),a,void 0,r)})}).then(function(e){return c===!0&&o.revokeObjectURL(s),Nu(e,a),e.userData.mimeType=a.mimeType||zu(a.uri),e}).catch(function(e){throw console.error(`THREE.GLTFLoader: Couldn't load texture`,s),e});return this.sourceCache[e]=l,l}assignTexture(e,t,n,r){let i=this;return this.getDependency(`texture`,n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),i.extensions[Z.KHR_TEXTURE_TRANSFORM]){let e=n.extensions===void 0?void 0:n.extensions[Z.KHR_TEXTURE_TRANSFORM];if(e){let t=i.associations.get(a);a=i.extensions[Z.KHR_TEXTURE_TRANSFORM].extendTexture(a,e),i.associations.set(a,t)}}return r!==void 0&&(a.colorSpace=r),e[t]=a,a})}assignFinalMaterial(e){let t=e.geometry,n=e.material,r=t.attributes.tangent===void 0,i=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){let e=`PointsMaterial:`+n.uuid,t=this.cache.get(e);t||(t=new la,lr.prototype.copy.call(t,n),t.color.copy(n.color),t.map=n.map,t.sizeAttenuation=!1,this.cache.add(e,t)),n=t}else if(e.isLine){let e=`LineBasicMaterial:`+n.uuid,t=this.cache.get(e);t||(t=new Yi,lr.prototype.copy.call(t,n),t.color.copy(n.color),t.map=n.map,this.cache.add(e,t)),n=t}if(r||i||a){let e=`ClonedMaterial:`+n.uuid+`:`;r&&(e+=`derivative-tangents:`),i&&(e+=`vertex-colors:`),a&&(e+=`flat-shading:`);let t=this.cache.get(e);t||(t=n.clone(),i&&(t.vertexColors=!0),a&&(t.flatShading=!0),r&&(t.normalScale&&(t.normalScale.y*=-1),t.clearcoatNormalScale&&(t.clearcoatNormalScale.y*=-1)),this.cache.add(e,t),this.associations.set(t,this.associations.get(n))),n=t}e.material=n}getMaterialType(){return wa}loadMaterial(e){let t=this,n=this.json,r=this.extensions,i=n.materials[e],a,o={},s=i.extensions||{},c=[];if(s[Z.KHR_MATERIALS_UNLIT]){let e=r[Z.KHR_MATERIALS_UNLIT];a=e.getMaterialType(),c.push(e.extendParams(o,i,t))}else{let n=i.pbrMetallicRoughness||{};if(o.color=new J(1,1,1),o.opacity=1,Array.isArray(n.baseColorFactor)){let e=n.baseColorFactor;o.color.setRGB(e[0],e[1],e[2],Ne),o.opacity=e[3]}n.baseColorTexture!==void 0&&c.push(t.assignTexture(o,`map`,n.baseColorTexture,Me)),o.metalness=n.metallicFactor===void 0?1:n.metallicFactor,o.roughness=n.roughnessFactor===void 0?1:n.roughnessFactor,n.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(o,`metalnessMap`,n.metallicRoughnessTexture)),c.push(t.assignTexture(o,`roughnessMap`,n.metallicRoughnessTexture))),a=this._invokeOne(function(t){return t.getMaterialType&&t.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(t){return t.extendMaterialParams&&t.extendMaterialParams(e,o)})))}i.doubleSided===!0&&(o.side=2);let l=i.alphaMode||Au.OPAQUE;if(l===Au.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,l===Au.MASK&&(o.alphaTest=i.alphaCutoff===void 0?.5:i.alphaCutoff)),i.normalTexture!==void 0&&a!==ur&&(c.push(t.assignTexture(o,`normalMap`,i.normalTexture)),o.normalScale=new U(1,1),i.normalTexture.scale!==void 0)){let e=i.normalTexture.scale;o.normalScale.set(e,e)}if(i.occlusionTexture!==void 0&&a!==ur&&(c.push(t.assignTexture(o,`aoMap`,i.occlusionTexture)),i.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=i.occlusionTexture.strength)),i.emissiveFactor!==void 0&&a!==ur){let e=i.emissiveFactor;o.emissive=new J().setRGB(e[0],e[1],e[2],Ne)}return i.emissiveTexture!==void 0&&a!==ur&&c.push(t.assignTexture(o,`emissiveMap`,i.emissiveTexture,Me)),Promise.all(c).then(function(){let n=new a(o);return i.name&&(n.name=i.name),Nu(n,i),t.associations.set(n,{materials:e}),i.extensions&&Mu(r,n,i),n})}createUniqueName(e){let t=Po.sanitizeNodeName(e||``);return t in this.nodeNamesUsed?t+`_`+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,r=this.primitiveCache;function i(e){return n[Z.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(e,t).then(function(n){return Uu(n,e,t)})}let a=[];for(let n=0,o=e.length;n<o;n++){let o=e[n],s=Iu(o),c=r[s];if(c)a.push(c.promise);else{let e;e=o.extensions&&o.extensions[Z.KHR_DRACO_MESH_COMPRESSION]?i(o):Uu(new Ar,o,t),r[s]={primitive:o,promise:e},a.push(e)}}return Promise.all(a)}loadMesh(e){let t=this,n=this.json,r=this.extensions,i=n.meshes[e],a=i.primitives,o=[];for(let e=0,t=a.length;e<t;e++){let t=a[e].material===void 0?ju(this.cache):this.getDependency(`material`,a[e].material);o.push(t)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(n){let o=n.slice(0,n.length-1),s=n[n.length-1],c=[];for(let n=0,l=s.length;n<l;n++){let l=s[n],u=a[n],d,f=o[n];if(u.mode===Su.TRIANGLES||u.mode===Su.TRIANGLE_STRIP||u.mode===Su.TRIANGLE_FAN||u.mode===void 0)d=i.isSkinnedMesh===!0?new Ei(l,f):new Hr(l,f),d.isSkinnedMesh===!0&&d.normalizeSkinWeights(),u.mode===Su.TRIANGLE_STRIP?d.geometry=Gl(d.geometry,1):u.mode===Su.TRIANGLE_FAN&&(d.geometry=Gl(d.geometry,2));else if(u.mode===Su.LINES)d=new sa(l,f);else if(u.mode===Su.LINE_STRIP)d=new ra(l,f);else if(u.mode===Su.LINE_LOOP)d=new ca(l,f);else if(u.mode===Su.POINTS)d=new ma(l,f);else throw Error(`THREE.GLTFLoader: Primitive mode unsupported: `+u.mode);Object.keys(d.geometry.morphAttributes).length>0&&Fu(d,i),d.name=t.createUniqueName(i.name||`mesh_`+e),Nu(d,i),u.extensions&&Mu(r,d,u),t.assignFinalMaterial(d),c.push(d)}for(let n=0,r=c.length;n<r;n++)t.associations.set(c[n],{meshes:e,primitives:n});if(c.length===1)return i.extensions&&Mu(r,c[0],i),c[0];let l=new ui;i.extensions&&Mu(r,l,i),t.associations.set(l,{meshes:e});for(let e=0,t=c.length;e<t;e++)l.add(c[e]);return l})}loadCamera(e){let t,n=this.json.cameras[e],r=n[n.type];if(!r){console.warn(`THREE.GLTFLoader: Missing camera parameters.`);return}return n.type===`perspective`?t=new ii(pt.radToDeg(r.yfov),r.aspectRatio||1,r.znear||1,r.zfar||2e6):n.type===`orthographic`&&(t=new go(-r.xmag,r.xmag,r.ymag,-r.ymag,r.znear,r.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Nu(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let e=0,r=t.joints.length;e<r;e++)n.push(this._loadNodeShallow(t.joints[e]));return t.inverseBindMatrices===void 0?n.push(null):n.push(this.getDependency(`accessor`,t.inverseBindMatrices)),Promise.all(n).then(function(e){let n=e.pop(),r=e,i=[],a=[];for(let e=0,o=r.length;e<o;e++){let o=r[e];if(o){i.push(o);let t=new q;n!==null&&t.fromArray(n.array,e*16),a.push(t)}else console.warn(`THREE.GLTFLoader: Joint "%s" could not be found.`,t.joints[e])}return new ji(i,a)})}loadAnimation(e){let t=this.json,n=this,r=t.animations[e],i=r.name?r.name:`animation_`+e,a=[],o=[],s=[],c=[],l=[];for(let e=0,t=r.channels.length;e<t;e++){let t=r.channels[e],n=r.samplers[t.sampler],i=t.target,u=i.node,d=r.parameters===void 0?n.input:r.parameters[n.input],f=r.parameters===void 0?n.output:r.parameters[n.output];i.node!==void 0&&(a.push(this.getDependency(`node`,u)),o.push(this.getDependency(`accessor`,d)),s.push(this.getDependency(`accessor`,f)),c.push(n),l.push(i))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(s),Promise.all(c),Promise.all(l)]).then(function(e){let t=e[0],a=e[1],o=e[2],s=e[3],c=e[4],l=[];for(let e=0,r=t.length;e<r;e++){let r=t[e],i=a[e],u=o[e],d=s[e],f=c[e];if(r===void 0)continue;r.updateMatrix&&r.updateMatrix();let p=n._createAnimationTracks(r,i,u,d,f);if(p)for(let e=0;e<p.length;e++)l.push(p[e])}let u=new Ga(i,void 0,l);return Nu(u,r),u})}createNodeMesh(e){let t=this.json,n=this,r=t.nodes[e];return r.mesh===void 0?null:n.getDependency(`mesh`,r.mesh).then(function(e){let t=n._getNodeRef(n.meshCache,r.mesh,e);return r.weights!==void 0&&t.traverse(function(e){if(e.isMesh)for(let t=0,n=r.weights.length;t<n;t++)e.morphTargetInfluences[t]=r.weights[t]}),t})}loadNode(e){let t=this.json,n=this,r=t.nodes[e],i=n._loadNodeShallow(e),a=[],o=r.children||[];for(let e=0,t=o.length;e<t;e++)a.push(n.getDependency(`node`,o[e]));let s=r.skin===void 0?Promise.resolve(null):n.getDependency(`skin`,r.skin);return Promise.all([i,Promise.all(a),s]).then(function(e){let t=e[0],n=e[1],r=e[2];r!==null&&t.traverse(function(e){e.isSkinnedMesh&&e.bind(r,Bu)});for(let e=0,r=n.length;e<r;e++)t.add(n[e]);return t})}_loadNodeShallow(e){let t=this.json,n=this.extensions,r=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let i=t.nodes[e],a=i.name?r.createUniqueName(i.name):``,o=[],s=r._invokeOne(function(t){return t.createNodeMesh&&t.createNodeMesh(e)});return s&&o.push(s),i.camera!==void 0&&o.push(r.getDependency(`camera`,i.camera).then(function(e){return r._getNodeRef(r.cameraCache,i.camera,e)})),r._invokeAll(function(t){return t.createNodeAttachment&&t.createNodeAttachment(e)}).forEach(function(e){o.push(e)}),this.nodeCache[e]=Promise.all(o).then(function(t){let o;if(o=i.isBone===!0?new Di:t.length>1?new ui:t.length===1?t[0]:new Hn,o!==t[0])for(let e=0,n=t.length;e<n;e++)o.add(t[e]);if(i.name&&(o.userData.name=i.name,o.name=a),Nu(o,i),i.extensions&&Mu(n,o,i),i.matrix!==void 0){let e=new q;e.fromArray(i.matrix),o.applyMatrix4(e)}else i.translation!==void 0&&o.position.fromArray(i.translation),i.rotation!==void 0&&o.quaternion.fromArray(i.rotation),i.scale!==void 0&&o.scale.fromArray(i.scale);if(!r.associations.has(o))r.associations.set(o,{});else if(i.mesh!==void 0&&r.meshCache.refs[i.mesh]>1){let e=r.associations.get(o);r.associations.set(o,{...e})}return r.associations.get(o).nodes=e,o}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],r=this,i=new ui;n.name&&(i.name=r.createUniqueName(n.name)),Nu(i,n),n.extensions&&Mu(t,i,n);let a=n.nodes||[],o=[];for(let e=0,t=a.length;e<t;e++)o.push(r.getDependency(`node`,a[e]));return Promise.all(o).then(function(e){for(let t=0,n=e.length;t<n;t++)i.add(e[t]);return r.associations=(e=>{let t=new Map;for(let[e,n]of r.associations)(e instanceof lr||e instanceof Lt)&&t.set(e,n);return e.traverse(e=>{let n=r.associations.get(e);n!=null&&t.set(e,n)}),t})(i),i})}_createAnimationTracks(e,t,n,r,i){let a=[],o=e.name?e.name:e.uuid,s=[];Ou[i.path]===Ou.weights?e.traverse(function(e){e.morphTargetInfluences&&s.push(e.name?e.name:e.uuid)}):s.push(o);let c;switch(Ou[i.path]){case Ou.weights:c=Ba;break;case Ou.rotation:c=Ha;break;case Ou.translation:case Ou.scale:c=Wa;break;default:switch(n.itemSize){case 1:c=Ba;break;default:c=Wa}}let l=r.interpolation===void 0?we:ku[r.interpolation],u=this._getArrayFromAccessor(n);for(let e=0,n=s.length;e<n;e++){let n=new c(s[e]+`.`+Ou[i.path],t.array,u,l);r.interpolation===`CUBICSPLINE`&&this._createCubicSplineTrackInterpolant(n),a.push(n)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let e=Ru(t.constructor),n=new Float32Array(t.length);for(let r=0,i=t.length;r<i;r++)n[r]=t[r]*e;t=n}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(e){return new(this instanceof Ha?xu:yu)(this.times,this.values,this.getValueSize()/3,e)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function Hu(e,t,n){let r=t.attributes,i=new Ht;if(r.POSITION!==void 0){let e=n.json.accessors[r.POSITION],t=e.min,a=e.max;if(t!==void 0&&a!==void 0){if(i.set(new W(t[0],t[1],t[2]),new W(a[0],a[1],a[2])),e.normalized){let t=Ru(Cu[e.componentType]);i.min.multiplyScalar(t),i.max.multiplyScalar(t)}}else{console.warn(`THREE.GLTFLoader: Missing min/max properties for accessor POSITION.`);return}}else return;let a=t.targets;if(a!==void 0){let e=new W,t=new W;for(let r=0,i=a.length;r<i;r++){let i=a[r];if(i.POSITION!==void 0){let r=n.json.accessors[i.POSITION],a=r.min,o=r.max;if(a!==void 0&&o!==void 0){if(t.setX(Math.max(Math.abs(a[0]),Math.abs(o[0]))),t.setY(Math.max(Math.abs(a[1]),Math.abs(o[1]))),t.setZ(Math.max(Math.abs(a[2]),Math.abs(o[2]))),r.normalized){let e=Ru(Cu[r.componentType]);t.multiplyScalar(e)}e.max(t)}else console.warn(`THREE.GLTFLoader: Missing min/max properties for accessor POSITION.`)}}i.expandByVector(e)}e.boundingBox=i;let o=new sn;i.getCenter(o.center),o.radius=i.min.distanceTo(i.max)/2,e.boundingSphere=o}function Uu(e,t,n){let r=t.attributes,i=[];function a(t,r){return n.getDependency(`accessor`,t).then(function(t){e.setAttribute(r,t)})}for(let t in r){let n=Du[t]||t.toLowerCase();n in e.attributes||i.push(a(r[t],n))}if(t.indices!==void 0&&!e.index){let r=n.getDependency(`accessor`,t.indices).then(function(t){e.setIndex(t)});i.push(r)}return Dt.workingColorSpace!==`srgb-linear`&&`COLOR_0`in r&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Dt.workingColorSpace}" not supported.`),Nu(e,t),Hu(e,t,n),Promise.all(i).then(function(){return t.targets===void 0?e:Pu(e,t.targets,n)})}var Wu={NORMAL:0,EMISSIVE:1,DECOR:2,STEAM:3,GLOW:5,GROOVED:6},Gu=.25,Ku=e=>Math.round(e)+Gu,qu=e=>{let t=new J(e);return[t.r,t.g,t.b]},Ju=new q,Yu=new mt,Xu=new Tn,Zu=new W,Qu=new W,$u=(e,t,n,r=0,i=0,a=0,o=1,s=o,c=o)=>Ju.compose(Zu.set(e,t,n),Yu.setFromEuler(Xu.set(r,i,a)),Qu.set(o,s,c)).clone();function ed(e){for(let t of Object.keys(e.attributes)){let n=e.attributes[t],r=n.itemSize,i=n.array;for(let e=0;e<n.count;e+=3)for(let t=0;t<r;t++){let n=(e+1)*r+t,a=(e+2)*r+t,o=i[n];i[n]=i[a],i[a]=o}}}var td=class{dynamic;parts=[];constructor(e=!1){this.dynamic=e}push(e,t,n,r){let i=e.attributes.position.count,a=new Float32Array(i*3),o=new Float32Array(i);for(let e=0;e<i;e++)a[e*3]=t[0],a[e*3+1]=t[1],a[e*3+2]=t[2],o[e]=n;if(e.setAttribute(`aColor`,new yr(a,3)),e.setAttribute(`aFlag`,new yr(o,1)),this.dynamic){let t=new Float32Array(i).fill(r?.mode??0),n=new Float32Array(i*3),a=new Float32Array(i*4);if(r?.anchor)for(let e=0;e<i;e++)n.set(r.anchor,e*3);let o=r?.anim;if(typeof o==`function`){let t=e.attributes.position;for(let e=0;e<i;e++)a.set(o(t.getX(e),t.getY(e),t.getZ(e)),e*4)}else if(o)for(let e=0;e<i;e++)a.set(o,e*4);e.setAttribute(`aMode`,new yr(t,1)),e.setAttribute(`aAnchor`,new yr(n,3)),e.setAttribute(`aAnim`,new yr(a,4))}this.parts.push(e)}pushPrepared(e){this.parts.push(e)}add(e,t,n,r=Wu.NORMAL,i=!1,a){let o=e.index?e.toNonIndexed():e.clone();for(let e of Object.keys(o.attributes))e!==`position`&&e!==`normal`&&o.deleteAttribute(e);t&&(o.applyMatrix4(t),t.determinant()<0&&ed(o)),(i||!o.attributes.normal)&&o.computeVertexNormals(),this.push(o,n,r,a)}build(){if(this.parts.length)return Ul(this.parts,!1);let e=new Ar,t=e=>new yr(new Float32Array,e);return e.setAttribute(`position`,t(3)),e.setAttribute(`normal`,t(3)),e.setAttribute(`aColor`,t(3)),e.setAttribute(`aFlag`,t(1)),this.dynamic&&(e.setAttribute(`aMode`,t(1)),e.setAttribute(`aAnchor`,t(3)),e.setAttribute(`aAnim`,t(4))),e}},nd={water:{shallow:8176844,deep:2382460,clarity:1.4,reflectivity:.55,roughness:.15,waveScale:.9,foam:15267060,foamAmount:.8,emission:0},canal:{shallow:4033150,deep:1790056,clarity:.5,reflectivity:.6,roughness:.12,waveScale:1.4,foam:14214882,foamAmount:.6,emission:0},pond:{shallow:5599308,deep:2112056,clarity:.45,reflectivity:.7,roughness:.03,waveScale:.8,foam:13621448,foamAmount:.3,emission:0},swamp:{shallow:6188086,deep:2896928,clarity:.15,reflectivity:.25,roughness:.08,waveScale:.7,foam:10133616,foamAmount:.4,emission:0},acid:{shallow:12120138,deep:5020188,clarity:.35,reflectivity:.35,roughness:.1,waveScale:.6,foam:15400880,foamAmount:1,emission:.45},lava:{shallow:16756794,deep:13121050,clarity:.05,reflectivity:.04,roughness:.3,waveScale:1.6,foam:3809304,foamAmount:.9,emission:1}},rd=e=>[e.shallow,e.deep,e.clarity,e.reflectivity,e.roughness,e.waveScale,e.foam,e.foamAmount,e.emission].join(`,`),id=.95,ad=class{limits;parts=[];materials=[];keys=[];sources=[];constructor(e={}){this.limits=cd(e)}add(e,t,n,r=[0,0],i=2.4){let a=rd(n),o=this.keys.indexOf(a);if(o<0){if(this.materials.length>=this.limits.fluidMaterials)throw Error(`At most ${this.limits.fluidMaterials} different fluid materials per scene`);o=this.materials.length,this.materials.push(n),this.keys.push(a)}let s=e.index?e.toNonIndexed():e.clone();for(let e of Object.keys(s.attributes))e!==`position`&&s.deleteAttribute(e);t&&(s.applyMatrix4(t),t.determinant()<0&&ed(s)),s.computeVertexNormals();let c=s.attributes.position,l=c.count,u=new Float32Array(l*3),d=new Float32Array(l).fill(o),f=new W,p=new W,m=new W,h=new W,g=new W;for(let e=0;e+2<l;e+=3){f.fromBufferAttribute(c,e),p.fromBufferAttribute(c,e+1),m.fromBufferAttribute(c,e+2),h.subVectors(p,f).cross(m.sub(f)).normalize(),Math.abs(h.y)>=.95?g.set(r[0],0,r[1]):g.set(0,-1,0).addScaledVector(h,h.y).normalize().multiplyScalar(i);for(let t=e*3;t<(e+3)*3;t+=3)u[t]=g.x,u[t+1]=g.y,u[t+2]=g.z}s.setAttribute(`aFlow`,new yr(u,3)),s.setAttribute(`aFluid`,new yr(d,1)),this.parts.push(s)}source(e,t,{y:n,radius:r=.6,strength:i=1,rings:a=!0}={}){if(this.sources.length>=this.limits.fluidSources)throw Error(`At most ${this.limits.fluidSources} fluid sources per scene`);this.sources.push({x:e,z:t,y:n,radius:r,strength:i,rings:a})}build(){let e;if(this.parts.length)e=Ul(this.parts,!1);else{e=new Ar;for(let[t,n]of[[`position`,3],[`normal`,3],[`aFlow`,3],[`aFluid`,1]])e.setAttribute(t,new yr(new Float32Array,n))}return{geometry:e,materials:[...this.materials],sources:[...this.sources]}}};function od(e){let t=/^water_([a-z]+)_/i.exec(e)?.[1].toLowerCase();return t&&Object.hasOwn(nd,t)?nd[t]:nd.water}var sd=Object.freeze({lamps:64,grooves:8,fluidMaterials:8,fluidSources:8});function cd(e={}){let t={...sd};for(let n of Object.keys(t)){let r=e[n]??t[n];if(!Number.isSafeInteger(r)||r<1||r>4096)throw RangeError(`limits.${n} must be a positive integer no greater than 4096`);t[n]=r}return Object.freeze(t)}function ld(e){return{...e,dynamicGeometry:e.dynamicGeometry??new td(!0).build(),lamps:e.lamps??[],fluids:e.fluids??new ad().build(),grooves:e.grooves??null,stats:e.stats??{triangles:0,paletteColors:0}}}var ud=`
float bayer4(ivec2 p){
  const int M[16] = int[16](0,8,2,10, 12,4,14,6, 3,11,1,9, 15,7,13,5);
  return (float(M[(p.x & 3) + (p.y & 3) * 4]) + 0.5) / 16.0;
}`,dd=`void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }`,fd=`
in vec3 aColor; in float aFlag;
out vec3 vN; out vec3 vC; out float vF; out float vD; out float vA;
flat out float vObjectId;
void main(){
  vObjectId = 0.0;
  vN = normal; vC = aColor; vF = aFlag; vA = 1.0;
  vec4 vp = viewMatrix * vec4(position, 1.0);
  vD = -vp.z;
  gl_Position = projectionMatrix * vp;
}`,pd=`
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
void seeThrough(float opacity){ if (opacity < 1.0 && uSeeThrough > 0.5) gl_Position = vec4(0.0, 0.0, 2.0, 1.0); }`,md=`
in vec3 aColor; in float aFlag;
out vec3 vN; out vec3 vC; out float vF; out float vD; out float vA;
flat out float vObjectId;
${pd}
void main(){
  vObjectId = instanceColor.r;
  mat4 model = modelMatrix * instanceMatrix;
  float opacity = instanceOpacity();
  vN = transpose(inverse(mat3(model))) * normal; vC = instanceTint(aColor); vF = aFlag; vA = opacity;
  vec4 vp = viewMatrix * model * vec4(position, 1.0);
  vD = -vp.z;
  gl_Position = projectionMatrix * vp;
  seeThrough(opacity);
}`,hd=`
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
void pose(inout vec3 pos, inout vec3 nrm, out float alpha){ poseAt(pos, nrm, alpha, aMode, aAnchor, aAnim, uTime); }`,gd=`${hd}
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
}`,_d=`
uniform float uTime; uniform float uNight;
in vec3 aColor; in float aFlag; in float aMode; in vec3 aAnchor; in vec4 aAnim;
out vec3 vN; out vec3 vC; out float vF; out float vD; out float vA;
flat out float vObjectId;
${gd}
${pd}
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
}`,vd=`
uniform float uTime; uniform float uNight;
in vec3 aColor; in float aFlag; in float aMode; in vec3 aAnchor; in vec4 aAnim;
out vec3 vN; out vec3 vC; out float vF; out float vD; out float vA;
flat out float vObjectId;
${hd}
void main(){
  vObjectId = 0.0;
  vec3 pos = position; vec3 nrm = normal; float alpha;
  pose(pos, nrm, alpha);
  vN = nrm; vC = aColor; vF = aFlag; vA = alpha;
  vec4 vp = viewMatrix * vec4(pos, 1.0);
  vD = -vp.z;
  gl_Position = projectionMatrix * vp;
}`,yd=`
precision highp float;
uniform int uSS;   // samples per art pixel along each axis: the dither threshold stays per art pixel
in vec3 vN; in vec3 vC; in float vF; in float vD; in float vA;
flat in float vObjectId;
layout(location = 0) out vec4 gAlbedo;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out float gObjectId;
${ud}
void main(){
  if (vA < 0.999 && vA < bayer4(ivec2(gl_FragCoord.xy) / uSS)) discard;
  float f = floor(vF + 0.5);
  gAlbedo = vec4(vC, 1.0 + f + (vF - f > 0.1 ? 0.25 : 0.0));   // + 0.25: thin mark (flags.ts)
  gNormal = vec4(normalize(vN), vD);
  gObjectId = vObjectId;
}`,bd=`
in vec3 aFlow; in float aFluid;
out vec3 vN; flat out vec3 vFlow; flat out float vSlot; out float vD;   // flow and slot are per triangle
void main(){
  vN = normal; vFlow = aFlow; vSlot = aFluid;
  vec4 vp = viewMatrix * vec4(position, 1.0);
  vD = -vp.z;
  gl_Position = projectionMatrix * vp;
}`,xd=`
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
}`,Sd=e=>`
#define MAX_FLUIDS ${e.fluidMaterials}
#define MAX_SOURCES ${e.fluidSources}
#define POOL_NORMAL_Y ${id.toFixed(4)}
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
}`,Cd=e=>`
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
${ud}

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

${Sd(e)}

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
}`,wd=`
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
}`,Td=`
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
}`,Ed=12,Dd=32;function Od(e,t){let n=Math.max(e,1)*6;for(let e=256;e>=Dd;e/=2){let r=Math.min(Ed,Math.floor(t/e),n),i=Math.ceil(n/r);if(r>=1&&i*e<=t)return{tile:e,cols:r,width:r*e,height:i*e}}throw Error(`lamp shadows: ${e} lamps do not fit a ${t}px texture even at ${Dd}px faces`)}var kd=[[[1,0,0],[0,1,0]],[[-1,0,0],[0,1,0]],[[0,1,0],[0,0,1]],[[0,-1,0],[0,0,1]],[[0,0,1],[0,1,0]],[[0,0,-1],[0,1,0]]],Ad=`
in float aFlag;
out vec3 vW; out float vF;
void main(){ vW = position; vF = aFlag; gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }`,jd=`
precision highp float;
uniform vec3 uLamp; uniform float uClearance;
in vec3 vW; in float vF;
out vec4 outDist;
void main(){
  int f = int(floor(vF + 0.5));
  float d = distance(vW, uLamp);
  if ((f != 0 && f != 1 && f != 6) || d < uClearance) discard;
  outDist = vec4(d);
}`;function Md(e){let t=e.getAttribute(`position`),n=e.getAttribute(`aFlag`),r=e.index,i=[],a=r?.count??t.count,o=Math.max(0,e.drawRange.start),s=Math.min(a,e.drawRange.start+e.drawRange.count);for(let e=o;e+2<s;e+=3){let t=r?r.getX(e):e,a=r?r.getX(e+1):e+1,o=r?r.getX(e+2):e+2,s=n.getX(t),c=Math.floor(s+.5);(n.getX(a)!==s||n.getX(o)!==s||c===0||c===1||c===6)&&i.push(t,a,o)}let c=new Ar;return c.setAttribute(`position`,t),c.setAttribute(`aFlag`,n),c.setIndex(i),c}var Nd=class{lamps;occluderTriangles;occluders;target;size=new U;tile;cols;rendered=!1;constructor(e,t,n){this.lamps=e;let r=Od(e.length,n);r.tile<256&&console.warn(`lamp shadows: ${e.length} lamps need ${r.tile}px faces to fit this device's ${n}px limit`),this.tile=r.tile,this.cols=r.cols,this.occluders=e.length?Md(t):new Ar().setIndex([]),this.occluderTriangles=this.occluders.index.count/3,this.size.set(r.width,r.height),this.target=new zt(this.size.x,this.size.y,{type:g,format:ee,minFilter:i,magFilter:i,depthBuffer:!0,generateMipmaps:!1})}render(e){if(this.rendered)return;this.rendered=!0;let t=new $r({vertexShader:Ad,fragmentShader:jd,glslVersion:ze,side:2,uniforms:{uLamp:{value:new W},uClearance:{value:0}}}),n=new pi,r=new Hr(this.occluders,t);r.frustumCulled=!1,n.add(r);let i=new ii(90,1,.02,200),a=e.getClearColor(new J),o=e.getClearAlpha(),s=e.autoClear;e.setRenderTarget(this.target),e.setClearColor(0,0),e.clear(),e.autoClear=!1,this.lamps.forEach((r,a)=>{t.uniforms.uLamp.value.copy(r.position),t.uniforms.uClearance.value=r.clearance??.45,kd.forEach(([t,o],s)=>{let c=a*6+s,l=c%this.cols*this.tile,u=Math.floor(c/this.cols)*this.tile;i.position.copy(r.position),i.up.set(...o),i.lookAt(r.position.clone().add(new W(...t))),i.updateMatrixWorld(),this.target.viewport.set(l,u,this.tile,this.tile),e.setRenderTarget(this.target),e.render(n,i)})}),e.autoClear=s,this.target.viewport.set(0,0,this.size.x,this.size.y),e.setRenderTarget(null),e.setClearColor(a,o),t.dispose()}dispose(){this.target.dispose(),this.occluders.deleteAttribute(`position`),this.occluders.deleteAttribute(`aFlag`),this.occluders.dispose()}},Pd=.12,Fd=1024,Id=.4,Ld=(e,t,n)=>{let r=pt.clamp((n-e)/(t-e),0,1);return r*r*(3-2*r)};function Rd(e,t){let n=e.getAttribute(`position`),r=e.getAttribute(`normal`),i=e.getAttribute(`aFlag`),a=e.getAttribute(`aColor`),o=e.index,c=o?.count??n?.count??0,l=e=>o?o.getX(e):e,u=new W,d=new W,f=new W,p=new W,m=new W,h=new W,g=[],v=new Map,y=e=>{let t=e;for(;g[t].parent!==t;)t=g[t].parent;for(;g[e].parent!==e;){let n=g[e].parent;g[e].parent=t,e=n}return t};if(n&&r&&i&&a)for(let e=0;e+2<c;e+=3){let t=[l(e),l(e+1),l(e+2)];if(t.some(e=>Math.round(i.getX(e))!==Wu.EMISSIVE))continue;u.fromBufferAttribute(n,t[0]),d.fromBufferAttribute(n,t[1]),f.fromBufferAttribute(n,t[2]),h.copy(p.subVectors(d,u).cross(m.subVectors(f,u)));let r=h.length()*.5;if(r<1e-7||(h.normalize(),Math.abs(h.y)>.35))continue;let o=[a.getX(t[0]),a.getY(t[0]),a.getZ(t[0])];if(Math.max(...o)<.08)continue;let s=u.clone().add(d).add(f).multiplyScalar(1/3),c=g.length;g.push({vertices:t,center:s,normal:h.clone(),color:o,area:r,parent:c});let _=[h.x,h.y,h.z].map(e=>Math.round(e*100)).join(`,`)+`:`+o.map(e=>Math.round(e*1e3)).join(`,`);for(let e of[u,d,f]){let t=_+`:`+[e.x,e.y,e.z].map(e=>Math.round(e*1e3)).join(`,`),n=v.get(t);n===void 0?v.set(t,c):g[y(c)].parent=y(n)}}let b=new Map;for(let e=0;e<g.length;e++){let t=y(e),n=b.get(t);n?n.push(e):b.set(t,[e])}let x=[];for(let e of b.values()){let r=g[e[0]],i=new W,a=[0,0,0],o=0,s=1/0,c=-1/0,l=1/0,u=-1/0;for(let t of e){let e=g[t];o+=e.area,i.addScaledVector(e.center,e.area);for(let t=0;t<3;t++)a[t]+=e.color[t]*e.area;for(let t of e.vertices){let e=n.getY(t),i=n.getX(t)*r.normal.z-n.getZ(t)*r.normal.x;s=Math.min(s,e),c=Math.max(c,e),l=Math.min(l,i),u=Math.max(u,i)}}if(o<.07||c-s<.2||u-l<.18)continue;i.multiplyScalar(1/o);for(let e=0;e<3;e++)a[e]/=o;if(t.some(e=>i.distanceTo(e.position)<(e.clearance??.45)+.12))continue;let d=[g[e[0]].center,g[e[e.length-1]].center],f=new W(r.normal.z,0,-r.normal.x),p=f.length();f.normalize();let m=i.x*r.normal.z-i.z*r.normal.x,h=[.06,.2,.5,.9].flatMap(e=>[l-e,u+e].map(e=>i.clone().addScaledVector(f,(e-m)/p)));x.push({center:i,source:i.clone(),normal:r.normal,color:a,area:o,probes:d,facadeProbes:h})}let S=new Map,C=(e,t)=>`${Math.floor(e)},${Math.floor(t)}`;for(let e of x)for(let t of[...e.probes,...e.facadeProbes]){let n=t.clone().addScaledVector(e.normal,-.06),r=t.clone().addScaledVector(e.normal,.65);for(let e=Math.floor(Math.min(n.x,r.x));e<=Math.floor(Math.max(n.x,r.x));e++)for(let t=Math.floor(Math.min(n.z,r.z));t<=Math.floor(Math.max(n.z,r.z));t++)S.set(`${e},${t}`,[])}if(S.size)for(let e=0;e+2<c;e+=3){let t=l(e),r=l(e+1),a=l(e+2),o=Math.round(i.getX(t));if(o!==Wu.NORMAL&&o!==Wu.GROOVED)continue;let s=Math.floor(Math.min(n.getX(t),n.getX(r),n.getX(a))),c=Math.floor(Math.max(n.getX(t),n.getX(r),n.getX(a))),u=Math.floor(Math.min(n.getZ(t),n.getZ(r),n.getZ(a))),d=Math.floor(Math.max(n.getZ(t),n.getZ(r),n.getZ(a)));for(let t=s;t<=c;t++)for(let n=u;n<=d;n++)S.get(`${t},${n}`)?.push(e)}let w=new W,E=new hn,D=x.filter(e=>e.probes.some(t=>{E.set(t.clone().addScaledVector(e.normal,.015),e.normal);let r=t.clone().addScaledVector(e.normal,.65),i=new Set;for(let e=Math.floor(Math.min(t.x,r.x));e<=Math.floor(Math.max(t.x,r.x));e++)for(let n=Math.floor(Math.min(t.z,r.z));n<=Math.floor(Math.max(t.z,r.z));n++)for(let t of S.get(C(e,n))??[])i.add(t);for(let e of i)if(u.fromBufferAttribute(n,l(e)),d.fromBufferAttribute(n,l(e+1)),f.fromBufferAttribute(n,l(e+2)),E.intersectTriangle(u,d,f,!1,w)&&w.distanceTo(E.origin)<.635)return!1;return!0})).map(({center:e,source:t,normal:r,color:i,area:a,facadeProbes:o})=>{let s=o.map(e=>{E.set(e.clone().addScaledVector(r,-.06),r);let t=e.clone().addScaledVector(r,.35),i=new Set;for(let e=Math.floor(Math.min(E.origin.x,t.x));e<=Math.floor(Math.max(E.origin.x,t.x));e++)for(let n=Math.floor(Math.min(E.origin.z,t.z));n<=Math.floor(Math.max(E.origin.z,t.z));n++)for(let t of S.get(C(e,n))??[])i.add(t);let a=1/0;for(let t of i){if(u.fromBufferAttribute(n,l(t)),d.fromBufferAttribute(n,l(t+1)),f.fromBufferAttribute(n,l(t+2)),h.copy(p.subVectors(d,u).cross(m.subVectors(f,u))).normalize(),h.dot(r)<.94||!E.intersectTriangle(u,d,f,!1,w))continue;let i=w.clone().sub(e).dot(r);i>=-.05&&i<=.35&&(a=Math.min(a,i))}return a});for(let e=0;e<s.length;e+=2)if(Number.isFinite(s[e])&&Number.isFinite(s[e+1])&&Math.abs(s[e]-s[e+1])<.03){t.addScaledVector(r,Math.max(0,Math.max(s[e],s[e+1])+.02));break}return{center:e,source:t,normal:r,color:i,area:a}}),ee=e=>pt.clamp(1+Math.sqrt(e.area)*.6,1.2,2.1),O=1/0,A=1/0,te=-1/0,j=-1/0;for(let e of D){let t=ee(e),n=e.center.x+e.normal.x*Id,r=e.center.z+e.normal.z*Id;O=Math.min(O,n-t-Pd),A=Math.min(A,r-t-Pd),te=Math.max(te,n+t+Pd),j=Math.max(j,r+t+Pd)}D.length||(O=A=0,te=j=1);let M=D.length?Math.min(Fd,Math.ceil((te-O)/Pd)):1,N=D.length?Math.min(Fd,Math.ceil((j-A)/Pd)):1,P=(te-O)/M,F=(j-A)/N,I=new Float32Array(M*N*4),L=new Float32Array(M*N),ne=new Float32Array(M*N*2);for(let e of D){let t=ee(e),n=e.center.x+e.normal.x*Id,r=e.center.z+e.normal.z*Id,i=Math.max(...e.color),a=Math.min(.8,.35+.28*Math.sqrt(e.area));for(let o=Math.max(0,Math.floor((r-t-A)/F));o<Math.min(N,Math.ceil((r+t-A)/F));o++)for(let s=Math.max(0,Math.floor((n-t-O)/P));s<Math.min(M,Math.ceil((n+t-O)/P));s++){let c=O+(s+.5)*P,l=A+(o+.5)*F,u=Math.hypot(c-n,l-r)/t;if(u>=1)continue;let d=(c-e.center.x)*e.normal.x+(l-e.center.z)*e.normal.z,f=a*(1-Ld(0,1,u))*Ld(-.08,.18,d),p=o*M+s,m=p*4;for(let t=0;t<3;t++)I[m+t]+=f*e.color[t]/i;I[m+3]+=f*e.center.y,L[p]+=f,ne[p*2]+=f*(e.source.x-c),ne[p*2+1]+=f*(e.source.z-l)}}let re=new Uint16Array(I.length),ie=new Uint16Array(ne.length);for(let e=0;e<L.length;e++){let t=e*4,n=Math.max(1,I[t],I[t+1],I[t+2]);for(let e=0;e<3;e++)re[t+e]=hr.toHalfFloat(I[t+e]/n);re[t+3]=hr.toHalfFloat(L[e]>0?I[t+3]/L[e]:0);for(let t=0;t<2;t++)ie[e*2+t]=hr.toHalfFloat(L[e]>0?ne[e*2+t]/L[e]:0)}for(let e=0;e<N;e++)for(let t=0;t<M;t++){let n=e*M+t;if(L[n]>0)continue;let r=-1,i=1/0,a=0;for(let n=-1;n<=1;n++)for(let o=-1;o<=1;o++){let s=t+o,c=e+n;if(s<0||s>=M||c<0||c>=N)continue;let l=c*M+s,u=o*o+n*n;L[l]>0&&(u<i||u===i&&L[l]>a)&&(r=l,i=u,a=L[l])}r>=0&&(re[n*4+3]=re[r*4+3],ie[n*2]=hr.toHalfFloat(ne[r*2]/L[r]+(r%M-t)*P),ie[n*2+1]=hr.toHalfFloat(ne[r*2+1]/L[r]+(Math.floor(r/M)-e)*F))}let R=new Oi(re,M,N,T,_);R.minFilter=R.magFilter=s,R.generateMipmaps=!1,R.needsUpdate=!0;let ae=new Oi(ie,M,N,k,_);return ae.minFilter=ae.magFilter=s,ae.generateMipmaps=!1,ae.needsUpdate=!0,{texture:R,source:ae,bounds:[O,A,te,j],panes:D}}var zd=.15,Bd=1024,Vd=-1e4,Hd=4,Ud=pt.clamp,Wd=e=>{let t=Ud(e,0,1);return t*t*(3-2*t)};function Gd(e){let t=(e,t)=>`${Math.round(e*1e5)},${Math.round(t*1e5)}`,n=e.map(e=>t(e.x0,e.z0)),r=e.map(e=>t(e.x1,e.z1)),i=new Map;e.forEach((e,t)=>{let r=i.get(n[t]);r?r.push(t):i.set(n[t],[t])});let a=new Uint8Array(e.length),o=[];for(let t=0;t<e.length;t++){if(a[t])continue;let s=t,c=[],l=new Map;for(;s>=0&&!a[s];){let t=n[s];l.set(t,c.length),c.push(s),a[s]=1;let u=e[s],d=(i.get(r[s])??[]).filter(e=>!a[e]),f=t=>{let n=e[t],r=u.x1-u.x0,i=u.z1-u.z0,a=n.x1-n.x0,o=n.z1-n.z0;return Math.atan2(r*o-i*a,r*a+i*o)};d.sort((e,t)=>f(t)-f(e)||e-t),s=d[0]??-1;let p=l.get(r[c[c.length-1]]);if(p!==void 0){let t=c.splice(p),r=[1/0,1/0,-1/0,-1/0],i=0;for(let n of t){let t=e[n];i+=t.x0*t.z1-t.x1*t.z0,r[0]=Math.min(r[0],t.x0),r[1]=Math.min(r[1],t.z0),r[2]=Math.max(r[2],t.x0),r[3]=Math.max(r[3],t.z0)}Math.abs(i)>2e-8&&o.push({edges:t,area:i*.5,bounds:r,group:o.length}),l.clear(),c.forEach((e,t)=>l.set(n[e],t))}}}let s=o.filter(e=>e.area>0),c=(t,n,r)=>{let i=!1;for(let a of r){let r=e[a];r.z0>n!=r.z1>n&&t<r.x0+(n-r.z0)*(r.x1-r.x0)/(r.z1-r.z0)&&(i=!i)}return i},l=(e,t,n,r,i,a)=>(n-e)*(a-t)-(r-t)*(i-e),u=(e,t)=>Math.max(e.x0,e.x1)<Math.min(t.x0,t.x1)||Math.max(t.x0,t.x1)<Math.min(e.x0,e.x1)||Math.max(e.z0,e.z1)<Math.min(t.z0,t.z1)||Math.max(t.z0,t.z1)<Math.min(e.z0,e.z1)?!1:l(e.x0,e.z0,e.x1,e.z1,t.x0,t.z0)*l(e.x0,e.z0,e.x1,e.z1,t.x1,t.z1)<=0&&l(t.x0,t.z0,t.x1,t.z1,e.x0,e.z0)*l(t.x0,t.z0,t.x1,t.z1,e.x1,e.z1)<=0,d=[];for(let t of o){let n=t.group;if(t.area<0){let[r,i,a,o]=t.bounds,l=s.filter(e=>e.bounds[0]<r&&e.bounds[1]<i&&e.bounds[2]>a&&e.bounds[3]>o).sort((e,t)=>e.area-t.area).find(n=>t.edges.every(t=>c(e[t].x0,e[t].z0,n.edges))&&!t.edges.some(t=>n.edges.some(n=>u(e[t],e[n]))));if(!l)continue;n=l.group}for(let r of t.edges)e[r].group=n,d.push(e[r])}return d}function Kd(e,t){let n=[],r=[],a=[],o=[],c=e.geometry.getAttribute(`position`),l=e.geometry.getAttribute(`aFlow`),u=e.geometry.index,d=u?.count??c?.count??0,f=e=>u?u.getX(e):e,p=1/0,m=1/0,h=-1/0,v=-1/0;for(let e=0;e+2<d;e+=3){let t=[f(e),f(e+1),f(e+2)],[i,s,u]=t.map(e=>new W().fromBufferAttribute(c,e)),d=s.clone().sub(i).cross(u.clone().sub(i)).normalize();if(Math.abs(d.y)<.95){o.push([i,s,u]);let e=Math.min(i.y,s.y,u.y);for(let t of[i,s,u])t.y<=e+.02&&r.push(t);continue}if(Math.max(i.y,s.y,u.y)-Math.min(i.y,s.y,u.y)>.05)continue;let g=(i.y+s.y+u.y)/3,_=a.findIndex(e=>Math.abs(e-g)<.025);_<0&&(_=a.length,a.push(g)),n.push({a:i,b:s,c:u,level:_,flow:[l?.getX(t[0])??0,l?.getZ(t[0])??0]});for(let e of[i,s,u])p=Math.min(p,e.x),m=Math.min(m,e.z),h=Math.max(h,e.x),v=Math.max(v,e.z)}for(let e of o)for(let t of a)for(let[n,i]of[[e[0],e[1]],[e[1],e[2]],[e[2],e[0]]])(n.y<=t&&i.y>t||i.y<=t&&n.y>t)&&r.push(n.clone().lerp(i,(t-n.y)/(i.y-n.y)));n.length?(p-=zd,m-=zd,h+=zd,v+=zd):(p=m=0,h=v=1);let y=n.length?Math.min(Bd,Math.ceil((h-p)/zd)):1,b=n.length?Math.min(Bd,Math.ceil((v-m)/zd)):1,x=(h-p)/y,S=(v-m)/b,C=y*b,w=new Float32Array(C).fill(Vd),E=new Int32Array(C).fill(-1),D=new Float32Array(C*2),O=new Float32Array(C*4),k=e=>p+(e+.5)*x,A=e=>m+(e+.5)*S,te=(e,t,n,r,i)=>[Math.max(0,Math.ceil((e-n)/r-.5)),Math.min(i-1,Math.floor((t-n)/r-.5))];for(let{a:e,b:t,c:r,level:i,flow:a}of n){let n=(t.z-r.z)*(e.x-r.x)+(r.x-t.x)*(e.z-r.z);if(Math.abs(n)<1e-10)continue;let[o,s]=te(Math.min(e.x,t.x,r.x),Math.max(e.x,t.x,r.x),p,x,y),[c,l]=te(Math.min(e.z,t.z,r.z),Math.max(e.z,t.z,r.z),m,S,b);for(let u=c;u<=l;u++)for(let c=o;c<=s;c++){let o=k(c),s=A(u),l=((t.z-r.z)*(o-r.x)+(r.x-t.x)*(s-r.z))/n,d=((r.z-e.z)*(o-r.x)+(e.x-r.x)*(s-r.z))/n;if(l<-1e-6||d<-1e-6||l+d>1+1e-6)continue;let f=u*y+c,p=l*e.y+d*t.y+(1-l-d)*r.y;p<=w[f]||(w[f]=p,E[f]=i,D[f*2]=a[0],D[f*2+1]=a[1])}}let j=t.getAttribute(`position`),M=t.index,N=M?.count??j?.count??0,P=e=>M?M.getX(e):e,F=new Uint8Array(C),I=new W,L=new W,ne=new W;for(let e=0;e<a.length;e++){let t=a[e],n=[],r=Array.from({length:b},()=>[]);for(let e=0;e+2<N;e+=3){if(I.fromBufferAttribute(j,P(e)),L.fromBufferAttribute(j,P(e+1)),ne.fromBufferAttribute(j,P(e+2)),Math.min(I.y,L.y,ne.y)>t||Math.max(I.y,L.y,ne.y)<=t)continue;let r=[];for(let[e,n]of[[I,L],[L,ne],[ne,I]])(e.y<=t&&n.y>t||n.y<=t&&e.y>t)&&r.push(e.clone().lerp(n,(t-e.y)/(n.y-e.y)));if(r.length!==2)continue;let[i,a]=r,o=(L.y-I.y)*(ne.z-I.z)-(L.z-I.z)*(ne.y-I.y),s=(L.x-I.x)*(ne.y-I.y)-(L.y-I.y)*(ne.x-I.x);o*(a.z-i.z)-s*(a.x-i.x)<0&&([i,a]=[a,i]),n.push({x0:i.x,z0:i.z,x1:a.x,z1:a.z,sign:o<0?1:-1,group:-1})}for(let e of Gd(n)){if(Math.abs(e.z0-e.z1)<1e-9)continue;let[t,n]=te(Math.min(e.z0,e.z1),Math.max(e.z0,e.z1),m,S,b);for(let i=t;i<=n;i++)r[i].push(e)}for(let t=0;t<b;t++){let n=A(t),i=[];for(let e of r[t])n<Math.min(e.z0,e.z1)||n>=Math.max(e.z0,e.z1)||i.push({x:e.x0+(n-e.z0)/(e.z1-e.z0)*(e.x1-e.x0),sign:e.sign,group:e.group});i.sort((e,t)=>e.x-t.x);let a=new Map,o=0,s=0;for(let n=0;n<y;n++){for(;s<i.length&&i[s].x<=k(n);){let e=i[s].x;do{let e=i[s++],t=a.get(e.group)??0,n=t+e.sign;a.set(e.group,n),o+=Number(n>0)-Number(t>0)}while(s<i.length&&Math.abs(i[s].x-e)<1e-9)}let r=t*y+n;E[r]===e&&o>0&&(F[r]=1)}}}let re=new Int32Array(C).fill(-1);for(let e=0;e<C;e++)(E[e]<0||F[e])&&(re[e]=e);let ie=(e,t)=>{if(t<0||t>=C)return;let n=re[t];if(E[t]!==E[e]&&(n=t),n<0)return;let r=e%y,i=Math.floor(e/y),a=n%y,o=Math.floor(n/y),s=re[e];((r-a)*x)**2+((i-o)*S)**2<(s<0?1/0:((r-s%y)*x)**2+((i-Math.floor(s/y))*S)**2)&&(re[e]=n)};for(let e=0;e<b;e++)for(let t=0;t<y;t++){let n=e*y+t;E[n]<0||F[n]||(t&&ie(n,n-1),e&&(ie(n,n-y),t&&ie(n,n-y-1),t+1<y&&ie(n,n-y+1)))}for(let e=b-1;e>=0;e--)for(let t=y-1;t>=0;t--){let n=e*y+t;E[n]<0||F[n]||(t+1<y&&ie(n,n+1),e+1<b&&(ie(n,n+y),t&&ie(n,n+y-1),t+1<y&&ie(n,n+y+1)))}let R=new Int32Array(C).fill(-1),ae=new Int32Array(C),oe=0;for(let e=0;e<C;e++){if(E[e]<0||F[e]||R[e]>=0)continue;let t=0,n=1;ae[0]=e,R[e]=oe;let r=t=>{E[t]===E[e]&&!F[t]&&R[t]<0&&(R[t]=oe,ae[n++]=t)};for(;t<n;){let e=ae[t++],n=e%y;n&&r(e-1),n+1<y&&r(e+1),e>=y&&r(e-y),e+y<C&&r(e+y)}oe++}let se=[];for(let e=0;e<b;e++)for(let t=0;t<y;t++){let n=e*y+t;if(E[n]<0||F[n])continue;let r=re[n],i=r<0?0:(t-r%y)*x,a=r<0?0:(e-Math.floor(r/y))*S,o=Math.hypot(i,a),s=r<0?Hd:Math.max(0,o-Math.min(x,S)*.5),c=D[n*2],l=D[n*2+1],u=Math.hypot(c,l),d=o?(c*i+l*a)/o:0,f=Math.exp(-s/.65),p=.35+.65*Wd(s/.6);O[n*4]=(c-Math.min(0,d)*(o?i/o:0)*f)*p,O[n*4+1]=(l-Math.min(0,d)*(o?a/o:0)*f)*p,O[n*4+2]=Ud(u*.2*Math.exp(-s/.35)+Math.max(0,-d)*.65*f,0,1),O[n*4+3]=Math.min(Hd,s),r>=0&&F[r]&&s<Math.max(x,S)&&d<-.25&&(t+e)%3==0&&se.push({x:k(t),z:A(e),component:R[n],vx:c/u,vz:l/u,strength:Math.min(.65,u*.45)})}let ce=(e,t,n,r,i)=>{if(!(n>0)||!(r>0))return;let[a,o]=te(e-n,e+n,p,x,y),[s,c]=te(t-n,t+n,m,S,b);for(let l=s;l<=c;l++)for(let s=a;s<=o;s++){let a=l*y+s;if(E[a]<0||F[a]||!i(a))continue;let o=Math.hypot(k(s)-e,A(l)-t)/n;o<1&&(O[a*4+2]=Math.max(O[a*4+2],Ud(r,0,1)*(1-Wd(o))))}};for(let e of se)for(let t=.3;t<=3;t+=.3)ce(e.x+e.vx*t,e.z+e.vz*t,.18+t*.22,e.strength*(1-t/3.3),t=>R[t]===e.component);for(let e of r)ce(e.x,e.z,.5,.9,t=>e.y-w[t]>=-.05&&e.y-w[t]<=.4);for(let t of e.sources)ce(t.x,t.z,t.radius,t.strength,e=>t.y===void 0||Math.abs(w[e]-t.y)<.05);for(let e=0;e<b;e++)for(let t=0;t<y;t++){let n=e*y+t;if(E[n]>=0&&!F[n])continue;let r=-1,i=1/0;for(let n=-1;n<=1;n++)for(let a=-1;a<=1;a++){let o=t+a,s=e+n;if(o<0||o>=y||s<0||s>=b)continue;let c=s*y+o,l=(a*x)**2+(n*S)**2;E[c]>=0&&!F[c]&&l<i&&(r=c,i=l)}r>=0?(w[n]=w[r],O.set(O.subarray(r*4,r*4+4),n*4),O[n*4+3]=0):w[n]=Vd}let le=new Oi(Uint16Array.from(O,hr.toHalfFloat),y,b,T,_),ue=new Oi(w,y,b,ee,g);le.minFilter=le.magFilter=s,ue.minFilter=ue.magFilter=i;for(let e of[le,ue])e.generateMipmaps=!1,e.needsUpdate=!0;return{texture:le,height:ue,bounds:[p,m,h,v]}}var qd=class{batch;id;detach;onHighlight;position=new W;quaternion=new mt;scale=new W(1,1,1);visible=!0;snap=!0;castShadow=!0;tint=null;drawn=new q;drawnVisible=!1;drawnCasts=!1;highlighted=!1;strength=.5;alpha=1;constructor(e,t,n,r){this.batch=e,this.id=t,this.detach=n,this.onHighlight=r}get highlight(){return this.highlighted}set highlight(e){e!==this.highlighted&&this.onHighlight(this,e)&&(this.highlighted=e)}get tintStrength(){return this.strength}set tintStrength(e){this.strength=Jd(`tintStrength`,e)}get opacity(){return this.alpha}set opacity(e){this.alpha=Jd(`opacity`,e)}setTransform(e,t,n){return this.position.copy(e),t instanceof Tn?this.quaternion.setFromEuler(t):t&&this.quaternion.copy(t),typeof n==`number`?this.scale.setScalar(n):n&&this.scale.copy(n),this}remove(){this.highlight=!1,this.detach(this)}},Jd=(e,t)=>{if(!(t>=0&&t<=1))throw RangeError(`PixelObject.${e} must be from 0 to 1, got ${t}`);return t},Yd=e=>{let t=Math.min(Math.max(e,0),1);return Math.round(255*(t<=.0031308?t*12.92:1.055*t**(1/2.4)-.055))};function Xd(e){let t=e.tint,n=t?Math.round(e.tintStrength*255):0,r=t&&n?Yd(t.r)<<16|Yd(t.g)<<8|Yd(t.b):0,i=e.opacity<1?Math.max(1,Math.round((1-e.opacity)*255)):0;return[e.id,r,n*256+i]}var Zd=[`position`,`normal`,`aColor`,`aFlag`],Qd=[`aMode`,`aAnchor`,`aAnim`],$d=new q().makeScale(-1,1,1),ef=class{geometry;materials;objects=[];meshes;motion;rigid;constructor(e,t,n=16){this.geometry=e,this.materials=t;let r=e.getAttribute(`aMode`);this.motion=!!r,this.rigid=!!r&&Array.from(r.array).some(e=>e>5.5),this.meshes=this.makeMeshes(n)}static slot(e,t){return+!!e+(t?0:2)}get mesh(){return this.meshes[0]}get mirrored(){return this.meshes[1]}get casters(){return this.meshes.slice(0,2)}makeMeshes(e){return[0,1,2,3].map(t=>{let n=new Bi(this.geometry,this.materials.gbuffer,e);return this.materials.depth&&(n.customDepthMaterial=this.materials.depth),n.instanceMatrix.setUsage(Re),n.instanceColor=new Mi(new Float32Array(e*3),3).setUsage(Re),n.castShadow=t<2,n.receiveShadow=!0,n.frustumCulled=!1,n.count=0,t%2&&(n.scale.x=-1),n})}grow(){if(this.objects.length<=this.mesh.instanceMatrix.count)return[];let e=this.meshes,t=this.mesh.instanceMatrix.count;for(;t<this.objects.length;)t*=2;return this.meshes=this.makeMeshes(t),e}},tf={outlines:!0,dither:!0,cleanup:!0,clouds:!0,contacts:!0,glow:!0,vignette:!0},nf=(e,t)=>{if(!Number.isSafeInteger(t)||t<1)throw RangeError(`${e} must be a positive integer`);return t},rf=(e,t,n)=>{if(!e.includes(t))throw Error(`posed shadow: three's shader has no '${t}'`);return e.replace(t,n)},af=(e,t,n)=>{if(e.length>t)throw Error(`At most ${t} entries are supported, got ${e.length}`);return[...e,...Array.from({length:t-e.length},n)]},of=class{canvas;pixelScene;limits;shadowMapSize;objectShadowMapSize;renderer;camera=new go(-1,1,1,-1,1,300);snapShift=new U;scene=new pi;light=new vo(16777215,1);gbufHi;shadowHi;gbuf;stylised;fluidBuf;withFluids;linearImage;noFluid=Object.assign(new Oi(new Float32Array(4),1,1,T,g),{needsUpdate:!0});fluidMesh;fluidMat;fluidScene=new pi;hasFluids;fluidMap;staticMesh;staticMat;resolveMat;dynMesh;dynMat;dynShadowMat;hasRigidParts;shadowMat;objectShadowMat;postMat;cleanMat;postHiMat;cleanHiMat;highlightWarmPending;warming=null;disposed=!1;quad;quadScene=new pi;quadCam=new go(-1,1,1,-1,0,1);shadowDirty=!0;batches=new Map;objectsById=new Map;nextObjectId=1;highlighted=new Set;drawnCamera={position:new W,right:new W,up:new W,fwd:new W,texel:1};pickBuf=new Float32Array(4);seeThroughIds=new Set;pickCamera=new go;drawnNight=0;pickTargets;retired=[];gbufDrawn=!1;objectMat;objectMotionMat;objectDepthMat;objectMaskMat;rigidObjectsShown=!1;objectShadowTime=NaN;objectLight;objectShadowDirty=!1;shadowCenter;lampShadows;windowLight;width=1;height=1;viewHeight=13;supersample=3;resolvePolicy=1;resolveThinOnly=!0;sun=new W(0,1,0);constructor(e,t,n={}){this.canvas=e;let r=this.pixelScene=ld(t);if(this.limits=cd(n.limits),this.shadowMapSize=nf(`shadowMapSize`,n.shadowMapSize??4096),this.objectShadowMapSize=nf(`objectShadowMapSize`,n.objectShadowMapSize??this.shadowMapSize),this.supersample=n.supersample??3,this.highlightWarmPending=n.warmHighlight??!1,this.supersample!==1&&this.supersample!==3)throw RangeError(`supersample must be 1 or 3`);if(this.resolvePolicy=n.resolvePolicy??1,!Number.isSafeInteger(this.resolvePolicy)||this.resolvePolicy<0||this.resolvePolicy>8)throw RangeError(`resolvePolicy must be an integer from 0 to 8`);this.resolveThinOnly=n.resolveThinOnly??!0;for(let[e,t]of[[`lamps`,r.lamps.length],[`grooves`,r.grooves?.positions.length??0],[`fluidMaterials`,r.fluids.materials.length],[`fluidSources`,r.fluids.sources.length]])if(t>this.limits[e])throw RangeError(`Scene ${e}: at most ${this.limits[e]} entries are supported, got ${t}`);this.renderer=new Hl({canvas:e,antialias:!1,alpha:!1,preserveDrawingBuffer:!0});let i=64+2*this.limits.lamps+this.limits.grooves+4*this.limits.fluidMaterials+2*this.limits.fluidSources,a=this.renderer.getContext(),o=a.getParameter(a.MAX_FRAGMENT_UNIFORM_VECTORS);if(i>o)throw this.renderer.forceContextLoss(),this.renderer.dispose(),RangeError(`Renderer limits need up to ${i} fragment uniform vectors, but this GPU supports ${o}; lower the limits`);this.renderer.setPixelRatio(1),this.renderer.outputColorSpace=Ne,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=1,this.renderer.shadowMap.autoUpdate=!1;let s=new $r({vertexShader:fd,fragmentShader:yd,glslVersion:ze,side:0,uniforms:{uSS:{value:1}}});s.shadowSide=2,this.staticMat=s,this.staticMesh=new Hr(r.staticGeometry,s),this.staticMesh.castShadow=!0,this.staticMesh.receiveShadow=!0,this.staticMesh.frustumCulled=!1,this.objectMat=new $r({vertexShader:md,fragmentShader:yd,glslVersion:ze,side:0,uniforms:{uSS:{value:1},uSeeThrough:{value:0}}}),this.objectMat.shadowSide=2,this.dynMat=new $r({vertexShader:vd,fragmentShader:yd,glslVersion:ze,side:2,uniforms:{uTime:{value:0},uNight:{value:0},uSS:{value:1}}}),this.dynMesh=new Hr(r.dynamicGeometry,this.dynMat),this.dynMesh.frustumCulled=!1,this.dynMesh.castShadow=!1,this.dynMesh.receiveShadow=!0,this.scene.add(this.staticMesh,this.dynMesh);let{center:c,radius:l}=r.shadow;this.shadowCenter=c.clone(),this.setupSun(this.light,l,this.shadowMapSize),this.scene.add(this.light,this.light.target),this.shadowMat=new Ca({color:0,opacity:1}),this.shadowMat.transparent=!1,this.shadowMat.blending=0,this.shadowMat.shadowSide=2;let u=`flat varying float vOpacity;`,d=`vOpacity = 1.0 - float(uint(instanceColor.b) & 255u) / 255.0;`,f=`${u}\nuniform int uSS;\n${ud}\nvoid main() {\n  if (vOpacity < 0.999 && vOpacity < bayer4(ivec2(gl_FragCoord.xy) / uSS)) discard;`;this.objectShadowMat=new Ca({color:0,opacity:1}),this.objectShadowMat.transparent=!1,this.objectShadowMat.blending=0,this.objectShadowMat.shadowSide=2,this.objectShadowMat.onBeforeCompile=e=>{e.uniforms.uSS=this.objectMat.uniforms.uSS,e.vertexShader=rf(rf(e.vertexShader,`#include <common>`,`#include <common>\n${u}`),`#include <begin_vertex>`,`#include <begin_vertex>\n  ${d}`),e.fragmentShader=rf(e.fragmentShader,`void main() {`,f)},this.objectShadowMat.customProgramCacheKey=()=>`pixel3d-object-shadow`,this.dynShadowMat=new Ca({color:0,opacity:1,side:2}),this.dynShadowMat.transparent=!1,this.dynShadowMat.blending=0,this.dynShadowMat.onBeforeCompile=e=>{e.uniforms.uTime=this.dynMat.uniforms.uTime,e.uniforms.uNight=this.dynMat.uniforms.uNight;let t=rf(e.vertexShader,`#include <common>`,`#include <common>
uniform float uTime; uniform float uNight;
attribute float aMode; attribute vec3 aAnchor; attribute vec4 aAnim;
varying float vMode;   // only so the fragment stage can drop non-rigid modes
${hd}`);t=rf(t,`#include <beginnormal_vertex>`,`vec3 posed = position; vec3 objectNormal = normal; float posedAlpha;
  pose(posed, objectNormal, posedAlpha); vMode = aMode;`),e.vertexShader=rf(t,`#include <begin_vertex>`,`vec3 transformed = posed;`),e.fragmentShader=rf(e.fragmentShader,`void main() {`,`varying float vMode;
void main() {
  if (vMode < 5.5) discard;`)};let p={uTime:this.dynMat.uniforms.uTime,uNight:this.dynMat.uniforms.uNight};this.objectMotionMat=new $r({vertexShader:_d,fragmentShader:yd,glslVersion:ze,side:0,uniforms:{...p,uSS:{value:1},uSeeThrough:this.objectMat.uniforms.uSeeThrough}}),this.objectMotionMat.shadowSide=2;let m=`uniform float uTime; uniform float uNight;
attribute float aMode; attribute vec3 aAnchor; attribute vec4 aAnim;
varying float vMode;
${gd}`,h=`vec3 posedW, posedN; float posedA;
  poseObject(modelMatrix * instanceMatrix, instanceColor.r, posedW, posedN, posedA); vMode = aMode;`,g=`vec4 mvPosition = viewMatrix * vec4(posedW, 1.0);
  gl_Position = projectionMatrix * mvPosition;`;this.objectDepthMat=new Ea({depthPacking:je}),this.objectDepthMat.onBeforeCompile=e=>{Object.assign(e.uniforms,p);let t=rf(e.vertexShader,`#include <common>`,`#include <common>\n${m}`);t=rf(t,`#include <begin_vertex>`,`#include <begin_vertex>\n  ${h}\n  if (aMode < 5.5) posedW = (modelMatrix * instanceMatrix * vec4(position, 1.0)).xyz;`),e.vertexShader=rf(t,`#include <project_vertex>`,g),e.fragmentShader=rf(e.fragmentShader,`void main() {`,`varying float vMode;
void main() {
  if (vMode > 1.5 && vMode < 5.5) discard;`)},this.objectDepthMat.customProgramCacheKey=()=>`pixel3d-object-depth`,this.objectMaskMat=new Ca({color:0,opacity:1}),this.objectMaskMat.transparent=!1,this.objectMaskMat.blending=0,this.objectMaskMat.shadowSide=2,this.objectMaskMat.onBeforeCompile=e=>{Object.assign(e.uniforms,p,{uSS:this.objectMat.uniforms.uSS});let t=rf(e.vertexShader,`#include <common>`,`#include <common>\n${m}\n${u}`);t=rf(t,`#include <beginnormal_vertex>`,`${h}\n  ${d}\n  #include <beginnormal_vertex>`),t=rf(t,`#include <defaultnormal_vertex>`,`vec3 transformedNormal = normalize(mat3(viewMatrix) * posedN);`),t=rf(t,`#include <project_vertex>`,g),e.vertexShader=rf(t,`#include <worldpos_vertex>`,`vec4 worldPosition = vec4(posedW, 1.0);`),e.fragmentShader=rf(e.fragmentShader,`void main() {`,`varying float vMode;\n${f}\n  if (vMode > 2.5 && vMode < 5.5) discard;`)},this.objectMaskMat.customProgramCacheKey=()=>`pixel3d-object-mask`;let _=r.dynamicGeometry.getAttribute(`aMode`)?.array??[];this.hasRigidParts=Array.from(_).some(e=>e>5.5);let{lamps:v,grooves:y,fluids:b}=r;this.fluidMat=new $r({vertexShader:bd,fragmentShader:xd,glslVersion:ze,side:2,uniforms:{tAlbedo:{value:null},tNormal:{value:null},uFwd:{value:new W}}}),this.fluidMesh=new Hr(b.geometry,this.fluidMat),this.fluidMesh.frustumCulled=!1,this.fluidScene.add(this.fluidMesh),this.hasFluids=b.geometry.attributes.position.count>0;let x=r.maps;this.fluidMap=x?{texture:x.fluids.texture.clone(),height:x.fluids.height.clone(),bounds:[...x.fluids.bounds]}:Kd(b,r.staticGeometry);let S=b.materials,C=b.sources,w=e=>af(S.map(t=>new K(...e(t))),this.limits.fluidMaterials,()=>new K),T=this.renderer.getContext();this.lampShadows=new Nd(v,r.staticGeometry,Math.min(this.renderer.capabilities.maxTextureSize,T.getParameter(T.MAX_RENDERBUFFER_SIZE))),this.windowLight=x?{texture:x.windows.texture.clone(),source:x.windows.source.clone(),bounds:[...x.windows.bounds],panes:x.windows.panes}:Rd(r.staticGeometry,v);let E={glslVersion:ze,depthTest:!1,depthWrite:!1};this.postMat=new $r({...E,vertexShader:dd,fragmentShader:Cd(this.limits),uniforms:{tAlbedo:{value:null},tNormal:{value:null},tShadow:{value:null},uRes:{value:new U},uTexel:{value:.05},uRight:{value:new W},uUp:{value:new W},uFwd:{value:new W},uCamPos:{value:new W},uSun:{value:this.sun},uTime:{value:0},uOutline:{value:1},uDither:{value:1},uClouds:{value:1},uContact:{value:1},uGlow:{value:1},uVignette:{value:1},uSunI:{value:1},uAmbient:{value:.34},uExpo:{value:1},uChroma:{value:1},uNight:{value:0},uLampOn:{value:0},uLitTint:{value:new U},uShadeTint:{value:new U},uSkyTop:{value:new J(7976668)},uSkyBot:{value:new J(16180930)},uLampCount:{value:v.length},tLampShadow:{value:this.lampShadows.target.texture},uLampAtlas:{value:new W(this.lampShadows.size.x,this.lampShadows.size.y,this.lampShadows.tile)},uLamp:{value:af(v.map(e=>new K(e.position.x,e.position.y,e.position.z,e.radius)),this.limits.lamps,()=>new K(0,0,0,1))},uLampCol:{value:af(v.map(e=>new W(...e.color)),this.limits.lamps,()=>new W)},tWindow:{value:this.windowLight.texture},tWindowSource:{value:this.windowLight.source},uWindowBounds:{value:new K(...this.windowLight.bounds)},uPass:{value:0},uDeferGrade:{value:0},tImage:{value:null},tFluidN:{value:null},tFluidF:{value:null},tFluidMap:{value:this.fluidMap.texture},tFluidHeight:{value:this.fluidMap.height},uFluidBounds:{value:new K(...this.fluidMap.bounds)},uFluidA:{value:w(e=>[...qu(e.shallow),e.clarity])},uFluidB:{value:w(e=>[...qu(e.deep),e.reflectivity])},uFluidC:{value:w(e=>[...qu(e.foam),e.roughness])},uFluidD:{value:w(e=>[e.waveScale,e.foamAmount,e.emission,0])},uSourceCount:{value:C.length},uSources:{value:af(C.map(e=>new K(e.x,e.z,e.rings?e.radius:-e.radius,e.strength)),this.limits.fluidSources,()=>new K)},uSourceY:{value:af(C.map(e=>e.y??-1e4),this.limits.fluidSources,()=>-1e4)},uGrooveCount:{value:y?.positions.length??0},uGrooves:{value:af(y?.positions??[],this.limits.grooves,()=>0)},uGrooveAxis:{value:new W(...y?.axis??[1,0,0])},uGrooveY:{value:new U(...y?.yRange??[0,0])},uHighlight:{value:new K}}}),this.cleanMat=new $r({...E,vertexShader:dd,fragmentShader:wd,uniforms:{tImage:{value:null},tAlbedo:{value:null},tNormal:{value:null},tShadow:{value:null},tFluid:{value:null},uRes:{value:new U},uOn:{value:1},...Object.fromEntries([`uHighlight`,`uTexel`,`uRight`,`uUp`,`uFwd`].map(e=>[e,this.postMat.uniforms[e]]))}}),this.resolveMat=new $r({...E,vertexShader:dd,fragmentShader:Td,uniforms:{tAlbedo:{value:null},tNormal:{value:null},tShadow:{value:null},tObjectId:{value:null},uS:{value:1},uPolicy:{value:0},uThinOnly:{value:0},uTexel:{value:.05},uRight:{value:new W},uUp:{value:new W},uFwd:{value:new W}}});let D=e=>new $r({...E,vertexShader:dd,fragmentShader:e.fragmentShader,uniforms:e.uniforms,defines:{HIGHLIGHT:``}});this.postHiMat=D(this.postMat),this.cleanHiMat=D(this.cleanMat),this.quad=new Hr(new Sa(2,2),this.postMat),this.quad.frustumCulled=!1,this.quadScene.add(this.quad)}setupSun(e,t,n){e.castShadow=!0,e.shadow.autoUpdate=!1,e.shadow.mapSize.set(n,n);let r=e.shadow.camera;r.left=-t,r.right=t,r.top=t,r.bottom=-t,r.near=1,r.far=140,e.shadow.bias=-4e-4,e.shadow.normalBias=.03}addObject(e){let t=Zd.filter(t=>!e.getAttribute(t));if(t.length)throw Error(`addObject: geometry has no ${t.join(`, `)} attribute`);let n=Qd.filter(t=>e.getAttribute(t));if(n.length&&n.length<Qd.length)throw Error(`addObject: geometry has ${n.join(`, `)} but not all of ${Qd.join(`, `)}`);if(n.length)for(let[t,n]of[[`aMode`,1],[`aAnchor`,3],[`aAnim`,4]]){let r=e.getAttribute(t).itemSize;if(r!==n)throw Error(`addObject: ${t} has ${r} components, not ${n}`)}if(this.nextObjectId>2**24)throw RangeError(`addObject: more than 2^24 objects added over this renderer's life`);if(!this.objectLight){let e=this.objectLight=new vo(16777215,1);this.setupSun(e,this.pixelScene.shadow.radius,this.objectShadowMapSize),e.position.copy(this.light.position),e.target.position.copy(this.light.target.position),e.target.updateMatrixWorld(),this.scene.add(e,e.target)}let r=this.batches.get(e);r||(r=new ef(e,n.length?{gbuffer:this.objectMotionMat,depth:this.objectDepthMat}:{gbuffer:this.objectMat}),this.batches.set(e,r),this.scene.add(...r.meshes));let i=new qd(r,this.nextObjectId++,e=>this.removeObject(e),(e,t)=>this.setHighlight(e,t));r.objects.push(i),this.objectsById.set(i.id,i);let a=r.grow();return a.length&&(this.retired.push(...a),this.scene.add(...r.meshes)),this.objectShadowDirty=!0,i}setHighlight(e,t){if(t&&this.objectsById.get(e.id)!==e)return!1;if(t&&this.highlighted.size>=4)throw RangeError(`PixelObject.highlight: at most 4 objects can be highlighted at once`);t?this.highlighted.add(e):this.highlighted.delete(e);let n=Array.from(this.highlighted,e=>e.id);return this.postMat.uniforms.uHighlight.value.set(n[0]??0,n[1]??0,n[2]??0,n[3]??0),!0}removeObject(e){let t=e.batch,n=t.objects.indexOf(e);n<0||(t.objects.splice(n,1),this.objectsById.delete(e.id),e.drawnCasts&&(this.objectShadowDirty=!0),t.objects.length||(this.retired.push(...t.meshes),this.batches.delete(t.geometry)))}poseObjects(){let e=this.viewHeight/this.height,t=this.camera.matrixWorld,n=new W().setFromMatrixColumn(t,0),r=new W().setFromMatrixColumn(t,1),i=new W().setFromMatrixColumn(t,2),a=new W,o=new q,s=new q;this.rigidObjectsShown=!1,this.seeThroughIds.clear();for(let t of this.batches.values()){let c=[0,0,0,0];for(let l of t.objects){let u=l.visible&&l.opacity>0&&l.scale.x!==0&&l.scale.y!==0&&l.scale.z!==0,d=u&&l.castShadow&&l.opacity>=1;if(u){if(a.copy(l.position),l.snap){let t=a.dot(n),o=a.dot(r);a.addScaledVector(n,Math.round(t/e)*e-t).addScaledVector(r,Math.round(o/e)*e-o),Math.abs(i.y)>.05&&a.addScaledVector(i,(l.position.y-a.y)/i.y)}o.compose(a,l.quaternion,l.scale);let u=o.determinant()<0,f=ef.slot(u,d),p=c[f]++,m=t.meshes[f],[h,g,_]=Xd(l);m.instanceColor.setXYZ(p,h,g,_),m.setMatrixAt(p,u?s.multiplyMatrices($d,o):o),l.opacity<1&&this.seeThroughIds.add(l.id)}(d!==l.drawnCasts||d&&!o.equals(l.drawn))&&(this.objectShadowDirty=!0),u&&l.drawn.copy(o),l.drawnVisible=u,l.drawnCasts=d}t.meshes.forEach((e,t)=>{if(e.count=c[t],c[t])for(let n of[e.instanceMatrix,e.instanceColor])n.clearUpdateRanges(),n.addUpdateRange(0,c[t]*n.itemSize),n.needsUpdate=!0}),t.rigid&&c[0]+c[1]>0&&(this.rigidObjectsShown=!0)}}setLook(e){let t=this.postMat.uniforms,n=pt.degToRad(e.sunAz),r=pt.degToRad(e.sunEl);this.sun.set(Math.sin(n)*Math.cos(r),Math.sin(r),Math.cos(n)*Math.cos(r)).normalize(),this.light.position.copy(this.sun).multiplyScalar(60).add(this.shadowCenter),this.light.target.position.copy(this.shadowCenter),this.light.target.updateMatrixWorld(),this.objectLight&&(this.objectLight.position.copy(this.light.position),this.objectLight.target.position.copy(this.light.target.position),this.objectLight.target.updateMatrixWorld(),this.objectShadowDirty=!0),this.shadowDirty=!0,t.uSunI.value=e.sunI,t.uAmbient.value=e.ambient,t.uExpo.value=e.expo,t.uChroma.value=e.chroma,t.uLitTint.value.set(...e.litTint),t.uShadeTint.value.set(...e.shadeTint),t.uLampOn.value=e.lampOn,t.uNight.value=e.night,t.uSkyTop.value.copy(e.skyTop),t.uSkyBot.value.copy(e.skyBot),this.dynMat.uniforms.uNight.value=e.night}resize(e,t){this.width=e,this.height=t,this.gbufDrawn=!1,this.renderer.setSize(e,t,!1);let n=this.supersample===3?3:1,r=(n,r=1,a=1)=>new zt(e*a,t*a,{minFilter:i,magFilter:i,depthBuffer:!0,generateMipmaps:!1,count:r,...n});for(let e of[this.gbufHi,this.shadowHi,this.gbuf,this.stylised,this.fluidBuf,this.withFluids,this.linearImage])e?.dispose();this.gbufHi=r({type:g},3,n),this.gbufHi.textures[2].format=ee,this.shadowHi=r({type:u},1,n),this.gbuf=r({type:g,depthBuffer:!1},3),this.stylised=r({type:u,depthBuffer:!1}),this.hasFluids&&(this.fluidBuf=r({type:g},2),this.withFluids=r({type:u,depthBuffer:!1}),this.linearImage=r({type:g,depthBuffer:!1})),this.staticMat.uniforms.uSS.value=n,this.objectMat.uniforms.uSS.value=n,this.objectMotionMat.uniforms.uSS.value=n,this.dynMat.uniforms.uSS.value=n,this.resolveMat.uniforms.uS.value=n,this.postMat.uniforms.uRes.value.set(e,t),this.cleanMat.uniforms.uRes.value.set(e,t)}placeCamera(e,t,n,r){this.viewHeight=r;let i=this.camera,a=r/2,o=a*(this.width/this.height);i.left=-o,i.right=o,i.top=a,i.bottom=-a,i.updateProjectionMatrix();let s=new W(Math.sin(t)*Math.cos(n),Math.sin(n),Math.cos(t)*Math.cos(n));i.position.copy(e).addScaledVector(s,100),i.lookAt(e),i.updateMatrixWorld();let c=r/this.height,l=new W().setFromMatrixColumn(i.matrixWorld,0),u=new W().setFromMatrixColumn(i.matrixWorld,1),d=Math.round(i.position.dot(l)/c)*c-i.position.dot(l),f=Math.round(i.position.dot(u)/c)*c-i.position.dot(u);this.snapShift.set(d/c,-f/c),i.position.addScaledVector(l,d).addScaledVector(u,f),i.updateMatrixWorld()}renderGeometry(e){let t=this.renderer;for(let e of this.retired)this.scene.remove(e),e.dispose();this.retired=[],this.lampShadows.render(t),this.dynMat.uniforms.uTime.value=e,this.poseObjects(),this.rigidObjectsShown&&e!==this.objectShadowTime&&(this.objectShadowDirty=!0),this.objectShadowTime=e;let n=[...this.batches.values()],r=n.flatMap(e=>e.meshes),i=n.flatMap(e=>e.casters),a=(e,t)=>{this.staticMesh.castShadow=e;for(let e of i)e.castShadow=t};this.shadowDirty&&=(this.light.shadow.needsUpdate=!0,t.shadowMap.needsUpdate=!0,!1),t.setClearColor(0,0);try{a(!0,!1),t.setRenderTarget(this.gbufHi),t.clear(),t.render(this.scene,this.camera)}finally{t.shadowMap.needsUpdate=!1,this.light.shadow.needsUpdate=!1}this.objectLight&&this.objectShadowDirty&&(this.objectLight.shadow.needsUpdate=!0,t.shadowMap.needsUpdate=!0,this.objectShadowDirty=!1),t.setClearColor(16777215,1);let o=t.autoClear;try{a(!1,!0),this.dynMesh.visible=!1,this.staticMesh.material=this.shadowMat;for(let e of n)for(let t of e.meshes)t.material=e.motion?this.objectMaskMat:this.objectShadowMat;if(t.setRenderTarget(this.shadowHi),t.clear(),t.render(this.scene,this.camera),this.hasRigidParts){this.dynMesh.visible=!0,this.staticMesh.visible=!1,this.scene.overrideMaterial=this.dynShadowMat;for(let e of r)e.visible=!1;t.autoClear=!1,t.render(this.scene,this.camera)}}finally{t.autoClear=o,this.scene.overrideMaterial=null,this.staticMesh.material=this.staticMat;for(let e of n)for(let t of e.meshes)t.material=e.motion?this.objectMotionMat:this.objectMat;t.shadowMap.needsUpdate=!1,this.objectLight&&(this.objectLight.shadow.needsUpdate=!1),a(!0,!0),this.staticMesh.visible=!0,this.dynMesh.visible=!0;for(let e of r)e.visible=!0}let s=this.resolveMat.uniforms;s.tAlbedo.value=this.gbufHi.textures[0],s.tNormal.value=this.gbufHi.textures[1],s.tShadow.value=this.shadowHi.texture,s.tObjectId.value=this.gbufHi.textures[2],s.uPolicy.value=this.resolvePolicy,s.uThinOnly.value=+!!this.resolveThinOnly,s.uTexel.value=this.viewHeight/this.height,s.uRight.value.setFromMatrixColumn(this.camera.matrixWorld,0),s.uUp.value.setFromMatrixColumn(this.camera.matrixWorld,1),s.uFwd.value.setFromMatrixColumn(this.camera.matrixWorld,2).negate(),this.quad.material=this.resolveMat,t.setRenderTarget(this.gbuf),t.render(this.quadScene,this.quadCam);let c=this.drawnCamera;if(this.gbufDrawn=!0,c.position.copy(this.camera.position),c.right.copy(s.uRight.value),c.up.copy(s.uUp.value),c.fwd.copy(s.uFwd.value),c.texel=s.uTexel.value,this.seeThroughIds.size&&(this.pickCamera.copy(this.camera),this.drawnNight=this.dynMat.uniforms.uNight.value),this.fluidBuf){t.setClearColor(0,0),t.setRenderTarget(this.fluidBuf),t.clear();let e=this.fluidMat.uniforms;e.tAlbedo.value=this.gbuf.textures[0],e.tNormal.value=this.gbuf.textures[1],e.uFwd.value.copy(s.uFwd.value),t.render(this.fluidScene,this.camera)}}renderStyle(e=tf,t=0){let n=typeof e==`number`?tf:e,r=this.highlighted.size>0,i=r?this.postHiMat:this.postMat,a=r?this.cleanHiMat:this.cleanMat;typeof e==`number`&&(t=e);let o=this.renderer,s=this.camera,c=this.postMat.uniforms;c.tAlbedo.value=this.gbuf.textures[0],c.tNormal.value=this.gbuf.textures[1],c.tShadow.value=this.gbuf.textures[2],c.uTexel.value=this.viewHeight/this.height,c.uRight.value.setFromMatrixColumn(s.matrixWorld,0),c.uUp.value.setFromMatrixColumn(s.matrixWorld,1),c.uFwd.value.setFromMatrixColumn(s.matrixWorld,2).negate(),c.uCamPos.value.copy(s.position),c.uTime.value=t,c.uContact.value=+!!n.contacts,c.uGlow.value=+!!n.glow,c.uVignette.value=+!!n.vignette,c.uOutline.value=+!!n.outlines,c.uDither.value=+!!n.dither,c.uClouds.value=+!!n.clouds;let l=this.fluidBuf?.textures??[this.noFluid,this.noFluid];c.tFluidN.value=l[0],c.tFluidF.value=l[1],this.quad.material=i,c.uPass.value=0,c.tImage.value=null,c.uDeferGrade.value=+!!this.hasFluids,o.setRenderTarget(this.linearImage??this.stylised),o.render(this.quadScene,this.quadCam);let u=this.stylised;this.linearImage&&this.withFluids&&(c.uPass.value=1,c.uDeferGrade.value=0,c.tImage.value=this.linearImage.texture,o.setRenderTarget(this.withFluids),o.render(this.quadScene,this.quadCam),u=this.withFluids),this.cleanMat.uniforms.tImage.value=u.texture,this.cleanMat.uniforms.tFluid.value=l[1],this.cleanMat.uniforms.tAlbedo.value=this.gbuf.textures[0],this.cleanMat.uniforms.tNormal.value=this.gbuf.textures[1],this.cleanMat.uniforms.tShadow.value=this.gbuf.textures[2],this.cleanMat.uniforms.uOn.value=+!!n.cleanup,this.quad.material=a,o.setRenderTarget(null),o.render(this.quadScene,this.quadCam),this.highlightWarmPending&&this.batches.size&&this.warmHighlight()}warmHighlight(){this.highlightWarmPending=!1;let e=this.renderer,t=e.getRenderTarget(),n=[[this.postHiMat,this.linearImage??this.stylised],[this.cleanHiMat,null]].map(([t,n])=>{let r=new pi().add(new Hr(this.quad.geometry,t));return e.setRenderTarget(n),e.compileAsync(r,this.quadCam).catch(()=>{})});e.setRenderTarget(t);let r=this.warming=Promise.all(n).finally(()=>{this.warming===r&&(this.warming=null)})}pick(e,t){let n=this.canvas.getBoundingClientRect();return this.pickPixel((e-n.left)/n.width*this.width,(t-n.top)/n.height*this.height)}pickPixel(e,t){let n=Math.floor(e),r=Math.floor(t);if(!this.gbufDrawn||!(n>=0&&r>=0&&n<this.width&&r<this.height))return null;let i=this.height-1-r,a=e=>(this.renderer.readRenderTargetPixels(this.gbuf,n,i,1,1,this.pickBuf,void 0,e),this.pickBuf),o={x:n,y:r,world:null,normal:null,object:null};if(a(0)[3]<.5)return o;let[s,c,l,u]=a(1),d=Math.round(a(2)[0]);if(this.seeThroughIds.has(d)){let e=this.pickBehind(n,i);if(e[0][3]<.5)return o;[s,c,l,u]=e[1],d=Math.round(e[2][0])}let f=this.drawnCamera;return o.normal=new W(s,c,l),o.world=f.position.clone().addScaledVector(f.right,(n+.5-.5*this.width)*f.texel).addScaledVector(f.up,(i+.5-.5*this.height)*f.texel).addScaledVector(f.fwd,u),o.object=this.objectsById.get(d)??null,o}pickBehind(e,t){let n=this.renderer,r=e-(e&3),a=t-(t&3),o=this.pickCamera,s=this.staticMat.uniforms.uSS.value,c=e=>new zt(e,e,{count:3,type:g,minFilter:i,magFilter:i,depthBuffer:!0,generateMipmaps:!1});this.pickTargets?.hi.width!==4*s&&(this.pickTargets?.hi.dispose(),this.pickTargets?.resolved.dispose(),this.pickTargets={hi:c(4*s),resolved:c(4)});let{hi:l,resolved:u}=this.pickTargets;o.setViewOffset(this.width,this.height,r,this.height-a-4,4,4);let d=this.resolveMat.uniforms,f=[d.tAlbedo.value,d.tNormal.value,d.tShadow.value,d.tObjectId.value],p=n.getRenderTarget(),m=n.getClearColor(new J),h=n.getClearAlpha(),_=this.dynMat.uniforms.uNight,v=_.value;try{this.objectMat.uniforms.uSeeThrough.value=1,_.value=this.drawnNight,n.setClearColor(0,0),n.setRenderTarget(l),n.clear(),n.render(this.scene,o),d.tAlbedo.value=l.textures[0],d.tNormal.value=l.textures[1],d.tShadow.value=l.textures[0],d.tObjectId.value=l.textures[2],this.quad.material=this.resolveMat,n.setRenderTarget(u),n.render(this.quadScene,this.quadCam)}finally{this.objectMat.uniforms.uSeeThrough.value=0,_.value=v,[d.tAlbedo.value,d.tNormal.value,d.tShadow.value,d.tObjectId.value]=f,n.setRenderTarget(p),n.setClearColor(m,h)}return[0,1,2].map(i=>{let o=new Float32Array(4);return n.readRenderTargetPixels(u,e-r,t-a,1,1,o,void 0,i),o})}readAlbedo(){let e=new Float32Array(this.width*this.height*4);return this.renderer.readRenderTargetPixels(this.gbuf,0,0,this.width,this.height,e,void 0,0),e}dispose(){if(this.disposed)return;this.disposed=!0,this.gbufDrawn=!1,this.objectsById.clear(),this.highlightWarmPending=!1;for(let e of[this.gbufHi,this.shadowHi,this.gbuf,this.stylised,this.fluidBuf,this.withFluids,this.linearImage,this.pickTargets?.hi,this.pickTargets?.resolved])e?.dispose();this.light.shadow.map?.dispose(),this.objectLight?.shadow.map?.dispose(),this.lampShadows.dispose(),this.windowLight.texture.dispose(),this.windowLight.source.dispose(),this.fluidMap.texture.dispose(),this.fluidMap.height.dispose(),this.noFluid.dispose();for(let e of[this.staticMesh,this.dynMesh,this.fluidMesh,this.quad])e.geometry.dispose();for(let e of this.batches.values())for(let t of e.meshes)t.dispose();for(let e of this.retired)e.dispose();for(let e of[this.staticMat,this.objectMat,this.objectMotionMat,this.objectDepthMat,this.objectMaskMat,this.dynMat,this.dynShadowMat,this.shadowMat,this.objectShadowMat,this.postMat,this.cleanMat,this.resolveMat,this.fluidMat])e.dispose();let e=()=>{this.postHiMat.dispose(),this.cleanHiMat.dispose(),this.renderer.dispose()};this.warming?this.warming.then(e):e()}},sf={STATIC:0,SWAY:1,CONVEYOR:2,SMOKE:3,BUTTERFLY:4,FIREFLY:5,SPIN:6,SWING:7},cf={sway:(e,t,n,r=.5)=>({mode:sf.SWAY,anim:(i,a)=>[Math.min(Math.max((a-n)/r,0),1.6)**1.3,e,t,0]}),conveyor:(e,t,n,r)=>({mode:sf.CONVEYOR,anchor:e,anim:[t,n,r,0]}),smoke:(e,t,n)=>({mode:sf.SMOKE,anchor:e,anim:[t,n,0,0]}),butterfly:(e,t,n)=>({mode:sf.BUTTERFLY,anchor:e,anim:[t,n,0,0]}),firefly:(e,t,n)=>({mode:sf.FIREFLY,anchor:e,anim:[t,n,0,0]}),spin:(e,t,n)=>({mode:sf.SPIN,anchor:e,anim:[...t,n]}),swing:(e,t,n)=>({mode:sf.SWING,anchor:e,anim:[...t,n]})},lf=/^(decor|water|glass|thin|move|lamp)_/i,uf=e=>!lf.test(e.name)&&e.parent?.type===`Group`?e.parent.name:e.name;function df(e){let t=uf(e).toLowerCase();if(t.startsWith(`glass_`))return{skip:!0};if(t.startsWith(`water_`))return{fluid:od(t)};if(t.startsWith(`decor_`))return{flag:Wu.DECOR};if(t.startsWith(`thin_`))return{thin:!0}}function ff(e){for(let t=e;t;t=t.parent){let e=/^move_(spin|sway)_/i.exec(t.name);if(!e)continue;let n=t.getWorldPosition(new W).toArray(),r=new W().setFromMatrixColumn(t.matrixWorld,0).normalize().toArray(),{speed:i=.6,amplitude:a=.1}=t.userData;return e[1].toLowerCase()===`spin`?cf.spin(n,r,i):cf.swing(n,r,a)}}async function pf(e){let t=await new Kl().loadAsync(e);return t.scene.updateMatrixWorld(!0),t.scene}function mf(e,t,n,r=()=>{},i){e.traverse(e=>{let a=e;if(!a.isMesh)return;let o=a.material,s=r(a,o)??{};if(s.skip)return;if(s.fluid){if(!i)throw Error(`collectGltf: '${uf(a)}' is a fluid, but no fluid collector was given`);i.add(a.geometry,a.matrixWorld,s.fluid,s.flow);return}let c=o.emissive,l=s.flag??(c&&c.r+c.g+c.b>.05?Wu.EMISSIVE:Wu.NORMAL),u=s.thin?Ku(l):l,d=s.color??[o.color.r,o.color.g,o.color.b];s.motion?n.add(a.geometry,a.matrixWorld,d,u,!1,s.motion):t.add(a.geometry,a.matrixWorld,d,u)})}var hf=([e,t,n])=>{let r=Math.cbrt(.4122214708*e+.5363325363*t+.0514459929*n),i=Math.cbrt(.2119034982*e+.6806995451*t+.1073969566*n),a=Math.cbrt(.0883024619*e+.2817188376*t+.6299787005*n);return[.2104542553*r+.793617785*i-.0040720468*a,1.9779984951*r-2.428592205*i+.4505937099*a,.0259040371*r+.7827717662*i-.808675766*a]},gf=([e,t,n])=>{let r=(e+.3963377774*t+.2158037573*n)**3,i=(e-.1055613458*t-.0638541728*n)**3,a=(e-.0894841775*t-1.291485548*n)**3;return[4.0767416621*r-3.3077115913*i+.2309699292*a,-1.2684380046*r+2.6097574011*i-.3413193965*a,-.0041960863*r-.7034186147*i+1.707614701*a]};function _f(e,t){if(!Number.isInteger(t)||t<1)throw RangeError(`palette size must be a whole number of at least 1, got ${t}`);let n=(e,t,n)=>{let r=e=>Math.round(e*1023);return r(e.getX(n))*1048576+r(e.getY(n))*1024+r(e.getZ(n))+Math.round(t.getX(n))*1e10},r=new Map,i=new W,a=new W,o=new W;for(let t of e){let e=t.attributes.aColor,s=t.attributes.aFlag,c=t.attributes.position;for(let t=0;t<e.count;t++){let l=n(e,s,t),u=r.get(l);u||r.set(l,u={lab:hf([e.getX(t),e.getY(t),e.getZ(t)]),area:0,idx:0}),t%3==0&&(u.area+=.5*a.fromBufferAttribute(c,t+1).sub(i.fromBufferAttribute(c,t)).cross(o.fromBufferAttribute(c,t+2).sub(i)).length())}}let s=[...r.values()];if(s.length<=t)return s.length;let c=yf(s,t).map(e=>gf(e).map(e=>Math.min(1,Math.max(0,e))));for(let t of e){let e=t.attributes.aColor,i=t.attributes.aFlag;for(let t=0;t<e.count;t++){let a=c[r.get(n(e,i,t)).idx];e.setXYZ(t,a[0],a[1],a[2])}}return new Set(s.map(e=>e.idx)).size}var vf=(e,t)=>(e[0]-t[0])**2+3.2*(e[1]-t[1])**2+3.2*(e[2]-t[2])**2;function yf(e,t){let n=e=>{let t=0,n=[0,0,0];for(let r of e){let e=Math.sqrt(r.area)+1e-6;t+=e,n[0]+=r.lab[0]*e,n[1]+=r.lab[1]*e,n[2]+=r.lab[2]*e}return[n[0]/t,n[1]/t,n[2]/t]},r=(e,t)=>{let r=e.concat(t),i=n(r),a=0;for(let e of r)a=Math.max(a,vf(e.lab,i));return a},i=e.map(e=>[e]),a=i.map((e,t)=>i.map((n,i)=>i>t?r(e,n):0));for(;i.length>t;){let e=0,t=1,n=1/0;for(let r=0;r<i.length;r++)for(let o=r+1;o<i.length;o++)a[r][o]<n&&(n=a[r][o],e=r,t=o);i[e]=i[e].concat(i[t]),i.splice(t,1),a.splice(t,1);for(let e of a)e.splice(t,1);for(let t=0;t<i.length;t++)if(t!==e){let n=r(i[e],i[t]);t>e?a[e][t]=n:a[t][e]=n}}return i.forEach((e,t)=>e.forEach(e=>e.idx=t)),i.map(n)}var bf=(e,t,n)=>e+(t-e)*n,xf=(e,t,n)=>new J(e).lerp(new J(t),n);function Sf(e,t={}){if(e.length===0)throw Error(`A day cycle needs at least one key`);for(let[e,n]of Object.entries(t))if(!(n>=0&&n<=24))throw Error(`Day cycle preset "${e}" is at hour ${n}, outside 0-24`);e.forEach((t,n)=>{if(!(t.hour>=0&&t.hour<=24))throw Error(`Day cycle key ${n} is at hour ${t.hour}, outside 0-24`);if(n>0&&!(t.hour>e[n-1].hour))throw Error(`Day cycle key ${n} (hour ${t.hour}) is not after the one before it`)});let n=e=>typeof e==`object`&&e.isColor?new J().copy(e):e,r=Object.freeze(e.map(e=>Object.freeze({...e,litTint:Object.freeze([...e.litTint]),shadeTint:Object.freeze([...e.shadeTint]),skyTop:n(e.skyTop),skyBot:n(e.skyBot)}))),i=Object.freeze({...t}),a=e=>(e%24+24)%24,o=r[0],s=r[r.length-1],c=[...o.hour>0?[{...s,hour:s.hour-24}]:[],...r,...s.hour<24?[{...o,hour:o.hour+24}]:[]],l=e=>{let t=a(e),n=0;for(;n<c.length-2&&t>=c[n+1].hour;)n++;let r=c[n],i=c[n+1],o=i.hour>r.hour?(t-r.hour)/(i.hour-r.hour):0,s=o*o*(3-2*o),l=e=>bf(r[e],i[e],s);return{hour:t,sunAz:l(`sunAz`),sunEl:l(`sunEl`),sunI:l(`sunI`),ambient:l(`ambient`),expo:l(`expo`),chroma:l(`chroma`),litTint:[bf(r.litTint[0],i.litTint[0],s),bf(r.litTint[1],i.litTint[1],s)],shadeTint:[bf(r.shadeTint[0],i.shadeTint[0],s),bf(r.shadeTint[1],i.shadeTint[1],s)],lampOn:l(`lampOn`),night:l(`night`),skyTop:xf(r.skyTop,i.skyTop,s),skyBot:xf(r.skyBot,i.skyBot,s)}},u=(e,t)=>{let n=a(e-t);return Math.min(n,24-n)};return{keys:r,presets:i,lookAt:l,nearestPreset:e=>Object.entries(i).sort((t,n)=>u(t[1],e)-u(n[1],e))[0]?.[0]??``}}var Cf=Sf([[0,-50,38,.34,.3,.58,.95,-.006,-.044,.012,-.07,1,1,858168,2835058],[5.5,-50,38,.34,.3,.58,.95,-.006,-.044,.012,-.07,1,1,858168,2835058],[6.4,88,9,.78,.34,.88,1.04,.014,.03,.016,-.04,.7,.35,8228816,16763296],[8,66,26,1,.34,1,1.02,.006,.022,.01,-.03,0,0,8962280,16508616],[12,0,60,1,.34,1,1,0,.008,.006,-.026,0,0,7976668,16180930],[15.5,-38,38,1,.34,1,1.02,.004,.014,.01,-.032,0,0,7976668,16180930],[17.5,-60,24,1.05,.34,1.02,1.05,.012,.032,.02,-.054,.15,0,7316440,16762762],[18.8,-80,11,.95,.33,.93,1.06,.022,.042,.022,-.054,.6,.15,5926848,16752494],[19.8,-92,3,.4,.31,.74,1,-.004,-.02,.012,-.05,1,.65,2372986,9071272],[21,-50,38,.34,.3,.58,.95,-.006,-.044,.012,-.07,1,1,858168,2835058],[24,-50,38,.34,.3,.58,.95,-.006,-.044,.012,-.07,1,1,858168,2835058]].map(([e,t,n,r,i,a,o,s,c,l,u,d,f,p,m])=>({hour:e,sunAz:t,sunEl:n,sunI:r,ambient:i,expo:a,chroma:o,litTint:[s,c],shadeTint:[l,u],lampOn:d,night:f,skyTop:p,skyBot:m})),{Morning:8,Noon:12,"Golden hour":17.5,Dusk:19.5,Night:22});Cf.presets;var wf=e=>Cf.lookAt(e),Tf=e=>{let t=Math.floor(e),n=Math.floor((e-t)*60);return`${String(t).padStart(2,`0`)}:${String(n).padStart(2,`0`)}`},Ef=[`wheat`,`beans`,`tomato`,`sunflower`,`flax`,`egg`,`manure`,`honey`,`flour`,`bran`,`oil`,`seedcake`,`compost`,`yarn`,`linen`,`bread`,`sauce`,`honeycake`],Df={wheat:{name:`Wheat`,price:2,colour:14860890,hint:`Milled into flour.`},beans:{name:`Beans`,price:2,colour:6986298,hint:`Chicken feed. Bean fields restore the soil.`},tomato:{name:`Tomato`,price:3,colour:14700602,hint:`Cooked into sauce.`},sunflower:{name:`Sunflower`,price:3,colour:15910458,hint:`Pressed into oil.`},flax:{name:`Flax`,price:3,colour:9087192,hint:`Spun into yarn.`},egg:{name:`Egg`,price:6,colour:16183264,hint:`Baked into bread and cake.`},manure:{name:`Manure`,price:1,colour:6964270,hint:`Composted, or burnt in the digester.`},honey:{name:`Honey`,price:10,colour:15769632,hint:`Baked into honey cake.`},flour:{name:`Flour`,price:7,colour:16051416,hint:`Baked into bread and cake.`},bran:{name:`Bran`,price:1,colour:12094026,hint:`A milling byproduct: chicken feed, compost or fuel.`},oil:{name:`Oil`,price:12,colour:15253568,hint:`Cooked into sauce.`},seedcake:{name:`Seed cake`,price:2,colour:10123850,hint:`A pressing byproduct: chicken feed, compost or fuel.`},compost:{name:`Compost`,price:4,colour:4863526,hint:`Feeds the soil: fields take it from belts.`},yarn:{name:`Yarn`,price:10,colour:14209256,hint:`Woven into linen.`},linen:{name:`Linen`,price:45,colour:15525072,hint:`A product. Deliver it.`},bread:{name:`Bread`,price:22,colour:13142602,hint:`A product. Deliver it.`},sauce:{name:`Tomato sauce`,price:40,colour:13119530,hint:`A product. Deliver it.`},honeycake:{name:`Honey cake`,price:60,colour:15249504,hint:`A product. Deliver it.`}},Of={feed:[`beans`,`bran`,`seedcake`],organic:[`manure`,`bran`,`seedcake`]},kf={feed:`feed (beans, bran or seed cake)`,organic:`organic matter (manure, bran or seed cake)`},Af=[`wheat`,`beans`,`tomato`,`sunflower`,`flax`],jf={wheat:{name:`Wheat`,grow:40,yield:3,soil:-1,flowers:!1,stages:4},beans:{name:`Beans`,grow:50,yield:2,soil:2.5,flowers:!0,stages:4},tomato:{name:`Tomato`,grow:60,yield:4,soil:-1.5,flowers:!0,stages:4},sunflower:{name:`Sunflower`,grow:70,yield:3,soil:-2,flowers:!0,stages:4},flax:{name:`Flax`,grow:55,yield:3,soil:-1.5,flowers:!0,stages:4}},Mf={store:6,compostStore:4,compostBelow:85,compostGain:12,dry:.4,poorSoil:.4,richSoil:1.4,rest:.1},Nf=[`belt`,`splitter`,`sorter`,`crossing`,`pad`,`field`,`sprinkler`,`coop`,`hive`,`composter`,`mill`,`press`,`spinner`,`loom`,`bakery`,`cannery`,`solar`,`turbine`,`battery`,`digester`,`pylon`,`sapling`,`depot`],Pf=[{id:`logistics`,name:`Logistics`},{id:`farming`,name:`Farming`},{id:`processing`,name:`Processing`},{id:`power`,name:`Power`},{id:`ecology`,name:`Ecology`}],Ff={belt:{name:`Belt`,size:1,cost:2,category:`logistics`,directional:!0,onWater:!0,key:`B`,hint:`Carries goods. Drag to lay a line; R turns it.`},splitter:{name:`Splitter`,size:1,cost:15,category:`logistics`,onWater:!0,hint:`Shares what comes in between the belts leading out of it.`},sorter:{name:`Sorter`,size:1,cost:20,category:`logistics`,directional:!0,onWater:!0,hint:`The chosen good goes straight on; the rest go left or right.`},crossing:{name:`Crossing`,size:1,cost:10,category:`logistics`,onWater:!0,hint:`Two belts cross without mixing.`},pad:{name:`Drone pad`,size:2,cost:120,category:`logistics`,power:15,hint:`Sends goods by drone to a linked pad (or the depot), up to 40 tiles away. Power while flying.`},field:{name:`Field`,size:3,cost:30,category:`farming`,key:`F`,hint:`Grows a crop on rich soil. Water it with sprinklers; feed it compost.`},sprinkler:{name:`Sprinkler`,size:1,cost:25,category:`farming`,power:3,hint:`Waters fields within 3 tiles. Cheaper to run near water.`},coop:{name:`Coop`,size:3,cost:150,category:`farming`,hint:`Chickens: 2 feed → 2 eggs + manure.`},hive:{name:`Beehive`,size:1,cost:60,category:`farming`,hint:`Honey from flowering fields nearby; pollinates them for a bigger harvest.`},composter:{name:`Composter`,size:2,cost:60,category:`farming`,hint:`Turns manure, bran or seed cake into compost.`},mill:{name:`Mill`,size:2,cost:200,category:`processing`,power:12,tall:!0,hint:`2 wheat → flour + bran.`},press:{name:`Oil press`,size:2,cost:220,category:`processing`,power:15,hint:`2 sunflowers → oil + seed cake.`},spinner:{name:`Spinner`,size:2,cost:200,category:`processing`,power:10,hint:`2 flax → yarn.`},loom:{name:`Loom`,size:2,cost:300,category:`processing`,power:20,hint:`3 yarn → linen.`},bakery:{name:`Bakery`,size:2,cost:350,category:`processing`,power:25,tall:!0,hint:`Flour + egg → bread, or + honey → honey cake.`},cannery:{name:`Cannery`,size:2,cost:300,category:`processing`,power:18,hint:`3 tomatoes + oil → tomato sauce.`},solar:{name:`Solar panel`,size:2,cost:70,category:`power`,key:`S`,hint:`30 W at noon; nothing at night.`},turbine:{name:`Wind turbine`,size:1,cost:120,category:`power`,tall:!0,hint:`40 W in full wind. Trees and tall buildings close by shelter it.`},battery:{name:`Battery`,size:2,cost:150,category:`power`,hint:`Stores power for the night.`},digester:{name:`Digester`,size:2,cost:180,category:`power`,hint:`Burns manure, bran or seed cake for a steady 30 W.`},pylon:{name:`Pylon`,size:1,cost:10,category:`power`,onWater:!0,key:`P`,hint:`Powers buildings within 3 tiles; links to pylons within 8.`},sapling:{name:`Sapling`,size:1,cost:5,category:`ecology`,hint:`Grows into a tree.`},depot:{name:`Freight depot`,size:3,cost:0,category:null,hint:`Deliver goods here.`}},If=[{id:`flour`,building:`mill`,inputs:[{item:`wheat`,n:2}],outputs:[{item:`flour`,n:1},{item:`bran`,n:1}],time:6},{id:`oil`,building:`press`,inputs:[{item:`sunflower`,n:2}],outputs:[{item:`oil`,n:1},{item:`seedcake`,n:1}],time:8},{id:`yarn`,building:`spinner`,inputs:[{item:`flax`,n:2}],outputs:[{item:`yarn`,n:1}],time:6},{id:`linen`,building:`loom`,inputs:[{item:`yarn`,n:3}],outputs:[{item:`linen`,n:1}],time:10},{id:`bread`,building:`bakery`,inputs:[{item:`flour`,n:1},{item:`egg`,n:1}],outputs:[{item:`bread`,n:1}],time:8},{id:`honeycake`,building:`bakery`,inputs:[{item:`flour`,n:1},{item:`egg`,n:1},{item:`honey`,n:1}],outputs:[{item:`honeycake`,n:1}],time:12},{id:`sauce`,building:`cannery`,inputs:[{item:`tomato`,n:3},{item:`oil`,n:1}],outputs:[{item:`sauce`,n:1}],time:10},{id:`compost`,building:`composter`,inputs:[{group:`organic`,n:2}],outputs:[{item:`compost`,n:1}],time:20},{id:`eggs`,building:`coop`,inputs:[{group:`feed`,n:2}],outputs:[{item:`egg`,n:2},{item:`manure`,n:1}],time:16},{id:`burn`,building:`digester`,inputs:[{group:`organic`,n:1}],outputs:[],time:10}],Lf=e=>If.filter(t=>t.building===e),Rf=e=>If.find(t=>t.id===e),zf={solar:30,turbine:40,shelter:.1,shelterFloor:.4,digester:30,battery:{capacity:2400,rate:40},pylon:{reach:3,link:8},sprinklerNearWater:3,sprinklerFar:8,waterNear:8,sprinklerReach:3},Bf={reach:4,maxFlowers:3,honeySeconds:45,store:6},Vf={speed:1.2,spacing:.5},Hf=.35,Uf={store:10,receiveStore:20,cargo:5,speed:5,range:40,waitSeconds:4},Wf={tree:5,rock:15},Gf={perTree:.25,cap:10},Kf=.1;function qf(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}function Jf(e){if(/^\d+$/.test(e.trim()))return Number(e.trim())>>>0;let t=2166136261;for(let n of e)t^=n.charCodeAt(0),t=Math.imul(t,16777619);return t>>>0}function Yf(e,t,n){let r=Math.imul(e|0,374761393)+Math.imul(t|0,668265263)+Math.imul(n|0,2246822519);return r=Math.imul(r^r>>>13,1274126177),((r^r>>>16)>>>0)/4294967296}var Xf=e=>e*e*(3-2*e);function Zf(e,t,n){let r=Math.floor(e),i=Math.floor(t),a=Xf(e-r),o=Xf(t-i),s=Yf(r,i,n),c=Yf(r+1,i,n),l=Yf(r,i+1,n),u=Yf(r+1,i+1,n);return s+(c-s)*a+(l-s)*o+(s-c-l+u)*a*o}function Qf(e,t,n,r=3){let i=0,a=1,o=0,s=1;for(let c=0;c<r;c++)i+=Zf(e*s,t*s,n+c*101)*a,o+=a,a*=.5,s*=2;return i/o}function $f(e,t){let n=Math.floor(e),r=Xf(e-n),i=Yf(n,0,t);return i+(Yf(n+1,0,t)-i)*r}var ep={grass:0,water:1,rock:2,tree:3},tp=8;function np(e){let{width:t,height:n,seed:r,terrain:i}=e,a=qf(r),o=Array(t*n).fill(ep.grass),s=Array(t*n).fill(0),c=(e,n)=>n*t+e,l=(e,r)=>e>=0&&r>=0&&e<t&&r<n,u={x:Math.floor(t/2-1+(a()-.5)*t*.4),y:n-3-1},d=(e,t)=>Math.max(Math.abs(e-(u.x+1)),Math.abs(t-(u.y+1)))<=tp;if(i.water===`river`){let e=a()<.5,i=a()*6.28,s=5+a()*4,d=2+a()*3;if(e){let e=u.x+1<t/2?t*(.62+a()*.2):t*(.18+a()*.2);for(let t=0;t<n;t++){let n=e+Math.sin(t/s+i)*d+(Zf(t/3,0,r+5)-.5)*2,a=1+Zf(t/4,1,r+6)*.9;for(let e=Math.floor(n-a);e<=Math.ceil(n+a);e++)l(e,t)&&Math.abs(e-n)<=a&&(o[c(e,t)]=ep.water)}}else{let e=n*(.22+a()*.25);for(let n=0;n<t;n++){let t=e+Math.sin(n/s+i)*d+(Zf(n/3,0,r+5)-.5)*2,a=1+Zf(n/4,1,r+6)*.9;for(let e=Math.floor(t-a);e<=Math.ceil(t+a);e++)l(n,e)&&Math.abs(e-t)<=a&&(o[c(n,e)]=ep.water)}}}else if(i.water===`ponds`||i.water===`lake`){let e=i.water===`lake`?1:3+Math.floor(a()*3);for(let s=0;s<e;s++){let e=i.water===`lake`?5+a()*2:1.6+a()*1.8,u=0,f=0;for(let e=0;e<20&&(u=3+a()*(t-6),f=3+a()*(n*.7),d(Math.round(u),Math.round(f)));e++);for(let t=Math.floor(f-e-2);t<=f+e+2;t++)for(let n=Math.floor(u-e-2);n<=u+e+2;n++)l(n,t)&&Math.hypot(n+.5-u,(t+.5-f)*1.15)<e+(Zf(n/2,t/2,r+9+s)-.5)*1.6&&(o[c(n,t)]=ep.water)}}let f=(e,r,i,a)=>{if(e<=0)return;let s=[],l=(e,t)=>Qf(e/r,t/r,i,3)*.85+Zf(e*1.7,t*1.7,i+3)*.15;for(let e=0;e<n;e++)for(let n=0;n<t;n++)o[c(n,e)]===ep.grass&&s.push(l(n,e));s.sort((e,t)=>t-e);let u=s[Math.min(s.length-1,Math.floor(s.length*e))];for(let e=0;e<n;e++)for(let n=0;n<t;n++)o[c(n,e)]!==ep.grass||d(n,e)||l(n,e)>u&&(o[c(n,e)]=a)};f(i.forest,7,r+21,ep.tree),f(i.rock,3.5,r+37,ep.rock);for(let e=0;e<n;e++)for(let n=0;n<t;n++){let t=i.soil+i.soilSpread*(Qf(n/9,e/9,r+51,3)*2-1)*1.6,a=!1;for(let t=-2;t<=2&&!a;t++)for(let r=-2;r<=2;r++)if(l(n+r,e+t)&&o[c(n+r,e+t)]===ep.water){a=!0;break}a&&(t+=10),s[c(n,e)]=Math.round(Math.max(5,Math.min(95,t)))}for(let e=u.y;e<u.y+3;e++)for(let t=u.x;t<u.x+3;t++)o[c(t,e)]=ep.grass;return{width:t,height:n,terrain:o,fertility:s,depot:u}}var rp=[0,1,0,-1],ip=[-1,0,1,0],ap=e=>(e+2)%4,op=e=>(e+3)%4,sp=e=>(e+1)%4;function cp(e){let t=np(e),n={version:1,scenario:e,map:t,soilBase:[...t.fertility],initialTrees:t.terrain.filter(e=>e===ep.tree).length,buildings:[],nextId:1,credits:e.credits,time:0,carry:0,delivered:{},earned:0,stats:{since:0,made:[{}],delivered:{}},reached:e.goals.map(()=>!1),completedAt:null,made:{}};return n.buildings.push(lp(n,`depot`,t.depot.x,t.depot.y,0)),n}function lp(e,t,n,r,i){let a={id:e.nextId++,type:t,x:n,y:r,rot:i,status:`idle`};switch(t){case`belt`:a.items=[];break;case`splitter`:case`crossing`:a.transit=[],a.turn=0;break;case`sorter`:a.transit=[],a.turn=0,a.filter=null;break;case`field`:a.crop=`wheat`,a.growth=0,a.stored=0,a.compost=0;break;case`hive`:a.growth=0,a.stored=0;break;case`battery`:a.charge=0;break;case`pad`:a.mode=`send`,a.link=null,a.store=[],a.drone={phase:`home`,t:0,cargo:[],target:0},a.waited=0;break;case`sapling`:a.age=0;break;default:{let e=Lf(t);e.length&&(a.recipe=e[0].id,a.inputs={},a.outputs={},a.progress=null)}}return a}var up=e=>Ff[e.type].size,dp=new WeakMap,fp=1;function pp(e){let t=dp.get(e);if(!t){t={grid:new Int32Array(e.map.width*e.map.height),byId:new Map,layout:fp++};for(let n of e.buildings)mp(e,t,n,n.id);dp.set(e,t)}return t}function mp(e,t,n,r){let i=up(n);for(let a=n.y;a<n.y+i;a++)for(let o=n.x;o<n.x+i;o++)t.grid[a*e.map.width+o]=r;r?t.byId.set(n.id,n):t.byId.delete(n.id)}var hp=e=>pp(e).layout;function gp(e,t){let n=pp(e);e.buildings.push(t),mp(e,n,t,t.id),n.layout=fp++}function _p(e){pp(e).layout=fp++}function vp(e,t){let n=pp(e),r=e.buildings.indexOf(t);r>=0&&e.buildings.splice(r,1),mp(e,n,t,0),n.layout=fp++;for(let n of e.buildings)n.link===t.id&&(n.link=null),n.drone&&n.drone.target===t.id&&n.drone.phase!==`home`&&(n.drone.phase=`back`,n.drone.target=0)}var yp=(e,t,n)=>t>=0&&n>=0&&t<e.map.width&&n<e.map.height,bp=(e,t,n)=>n*e.map.width+t;function xp(e,t,n){if(!yp(e,t,n))return null;let r=pp(e).grid[n*e.map.width+t];return r?pp(e).byId.get(r)??null:null}var Sp=(e,t)=>pp(e).byId.get(t)??null,Cp=(e,t,n)=>e.map.terrain[n*e.map.width+t];function wp(e){let t=up(e);return{x:e.x+t/2,y:e.y+t/2}}function Tp(e,t,n){let r=up(e),i=t<e.x?e.x-t:t>=e.x+r?t-(e.x+r-1):0,a=n<e.y?e.y-n:n>=e.y+r?n-(e.y+r-1):0;return Math.max(i,a)}var Ep=e=>{let t=0;for(let n of e.map.terrain)n===ep.tree&&t++;return t},Dp=new WeakMap,Op=e=>e.type!==`pylon`&&(kp(e)||Ap(e)||e.type===`battery`),kp=e=>e.type===`solar`||e.type===`turbine`||e.type===`digester`,Ap=e=>!!Ff[e.type].power;function jp(e){let t=hp(e),n=Dp.get(e);if(n&&n.layout===t)return n;let r=e.buildings.filter(e=>e.type===`pylon`),i=r.map((e,t)=>t),a=e=>i[e]===e?e:i[e]=a(i[e]);for(let e=0;e<r.length;e++)for(let t=e+1;t<r.length;t++)Math.hypot(r[e].x-r[t].x,r[e].y-r[t].y)<=zf.pylon.link&&(i[a(e)]=a(t));let o=new Map,s=[];r.forEach((e,t)=>{let n=a(t),r=o.get(n);r||(r={id:s.length+1,pylons:[],members:[],made:0,wanted:0,share:0,stored:0,capacity:0},o.set(n,r),s.push(r)),r.pylons.push(e)});let c=new Map;for(let e of r)c.set(e.id,o.get(a(r.indexOf(e))));for(let t of e.buildings){if(!Op(t))continue;let e=r.findIndex(e=>Tp(t,e.x,e.y)<=zf.pylon.reach);if(e<0)continue;let n=o.get(a(e));n.members.push(t),c.set(t.id,n)}if(n)for(let e of s){let t=n.list.find(t=>t.pylons.some(t=>e.pylons.includes(t)));t&&(e.made=t.made,e.wanted=t.wanted,e.share=t.share)}return n={layout:t,list:s,of:c},Dp.set(e,n),n}var Mp=(e,t)=>jp(e).of.get(t.id)??null,Np=e=>(7+e/240*24)%24,Pp=e=>1+Math.floor((e/240*24+7)/24);function Fp(e,t){let n=Np(t),r=e.weather;return n<=r.sunrise||n>=r.sunset?0:r.sun*Math.sin(Math.PI*(n-r.sunrise)/(r.sunset-r.sunrise))}function Ip(e,t){let n=e.weather,r=$f(t/45,e.seed+77)*.7+$f(t/11,e.seed+78)*.3;return Math.max(.05,Math.min(1,n.wind+(r-.5)*2*n.gust))}var Lp=new WeakMap;function Rp(e){let t=hp(e),n=Lp.get(e);if(n&&n.layout===t)return n;n={layout:t,outs:new Map,sprinklers:new Map,pollinated:new Set,flowers:new Map,exposure:new Map,nearWater:new Set,fielded:new Set,belts:Bp(e)};let r=e.buildings.filter(e=>e.type===`field`),i=e.buildings.filter(e=>e.type===`hive`),a=e.buildings.filter(e=>e.type===`sprinkler`);for(let t of e.buildings)t.type!==`belt`&&t.type!==`splitter`&&t.type!==`sorter`&&t.type!==`crossing`&&n.outs.set(t.id,zp(e,t));for(let t of r){for(let r=t.y;r<t.y+3;r++)for(let i=t.x;i<t.x+3;i++)n.fielded.add(bp(e,i,r));let r=wp(t);n.sprinklers.set(t.id,a.filter(e=>Math.max(Math.abs(e.x+.5-r.x),Math.abs(e.y+.5-r.y))<=zf.sprinklerReach+.5)),i.some(e=>Tp(t,e.x,e.y)<=Bf.reach)&&n.pollinated.add(t.id)}for(let e of i)n.flowers.set(e.id,r.filter(t=>Tp(t,e.x,e.y)<=Bf.reach));for(let t of e.buildings){if(t.type!==`turbine`)continue;let r=0,i=new Set;for(let n=t.y-2;n<=t.y+2;n++)for(let a=t.x-2;a<=t.x+2;a++){if(a===t.x&&n===t.y||a<0||n<0||a>=e.map.width||n>=e.map.height)continue;let o=xp(e,a,n);Cp(e,a,n)===ep.tree?r++:o&&o!==t&&Ff[o.type].tall&&i.add(o)}r+=i.size,n.exposure.set(t.id,Math.max(zf.shelterFloor,1-zf.shelter*r))}for(let t of a){let r=zf.waterNear;search:for(let i=t.y-r;i<=t.y+r;i++)for(let a=t.x-r;a<=t.x+r;a++)if(!(a<0||i<0||a>=e.map.width||i>=e.map.height||Math.hypot(a-t.x,i-t.y)>r)&&Cp(e,a,i)===ep.water){n.nearWater.add(t.id);break search}}return Lp.set(e,n),n}function zp(e,t){let n=up(t),r=[],i=(n,i,a)=>{let o=xp(e,n,i);o&&o.type===`belt`&&o.rot!==ap(a)&&!r.some(e=>e.belt===o)&&!Vp(e,o,t)&&r.push({belt:o,side:a})};for(let e=0;e<n;e++)i(t.x+e,t.y-1,0),i(t.x+n,t.y+e,1),i(t.x+e,t.y+n,2),i(t.x-1,t.y+e,3);return r}function Bp(e){let t=e.buildings.filter(e=>e.type===`belt`),n=new Map;for(let r of t){let t=xp(e,r.x+rp[r.rot],r.y+ip[r.rot]);n.set(r,t&&t.type===`belt`&&t.rot!==ap(r.rot)?t:null)}let r=new Map,i=e=>{let t=r.get(e);if(t!==void 0)return t;r.set(e,0);let a=n.get(e),o=a?i(a)+1:0;return r.set(e,o),o};for(let e of t)i(e);return t.map((e,t)=>({b:e,d:r.get(e),i:t})).sort((e,t)=>e.d-t.d||e.b.y-t.b.y||e.b.x-t.b.x||e.i-t.i).map(e=>e.b)}function Vp(e,t,n){let r=t;for(let t=0;t<8&&r&&r.type===`belt`;t++){let t=xp(e,r.x+rp[r.rot],r.y+ip[r.rot]);if(t===n)return!0;r=t}return!1}var Hp=(e,t)=>Rp(e).outs.get(t.id)??[],Up=(e,t)=>Rp(e).sprinklers.get(t.id)??[],Wp=(e,t)=>Rp(e).pollinated.has(t.id),Gp=(e,t)=>Rp(e).exposure.get(t.id)??1,Kp=(e,t)=>Rp(e).nearWater.has(t.id);function qp(e,t){let n=0;for(let r=t.y;r<t.y+3;r++)for(let i=t.x;i<t.x+3;i++)n+=e.map.fertility[bp(e,i,r)];return n/9}function Jp(e,t,n){for(let r=t.y;r<t.y+3;r++)for(let i=t.x;i<t.x+3;i++){let t=bp(e,i,r);e.map.fertility[t]=Math.max(0,Math.min(100,e.map.fertility[t]+n))}}function Yp(e){let t=e.buildings.filter(e=>e.type===`field`),n=t.length?t.reduce((t,n)=>t+qp(e,n),0)/t.length:50,r=Math.max(-Gf.cap,Math.min(Gf.cap,(Ep(e)-e.initialTrees)*Gf.perTree));return Math.max(0,Math.min(100,n+r))}function Xp(e,t){let n=Up(e,t).reduce((t,n)=>Math.max(t,cm(e,n)),0),r=Mf.dry+(1-Mf.dry)*n,i=Mf.poorSoil+(Mf.richSoil-Mf.poorSoil)*qp(e,t)/100;return{pace:r*i,water:n,soil:i}}var Zp=e=>`item`in e?[e.item]:Of[e.group],Qp=(e,t)=>Zp(t).reduce((t,n)=>t+(e.inputs[n]??0),0),$p=e=>`item`in e?Df[e.item].name.toLowerCase():kf[e.group],em=e=>e.recipe?Rf(e.recipe):null;function tm(e,t){return t.inputs.find(t=>Qp(e,t)<t.n)??null}function nm(e,t){return t.outputs.find(t=>(e.outputs[t.item]??0)+t.n>t.n*3)??null}function rm(e,t){for(let n of t.inputs){let t=n.n;for(;t>0;){let r=[...Zp(n)].sort((t,n)=>(e.inputs[n]??0)-(e.inputs[t]??0))[0];e.inputs[r]=(e.inputs[r]??0)-1,e.inputs[r]||delete e.inputs[r],t--}}}function im(e,t,n){switch(t.type){case`depot`:return am(e,n),!0;case`field`:return n!==`compost`||t.compost>=Mf.compostStore?!1:(t.compost++,!0);case`pad`:return t.mode!==`send`||t.store.length>=Uf.store?!1:(t.store.push(n),!0)}let r=em(t);if(!r)return!1;let i=r.inputs.find(e=>Zp(e).includes(n));return!i||Qp(t,i)>=i.n*3?!1:(t.inputs[n]=(t.inputs[n]??0)+1,!0)}function am(e,t){e.delivered[t]=(e.delivered[t]??0)+1,e.credits+=Df[t].price,e.earned+=Df[t].price,(e.stats.delivered[t]??=[]).push(e.time)}function om(e,t,n){e.made[t]=(e.made[t]??0)+n;let r=e.stats.made[0];r[t]=(r[t]??0)+n}var sm=new WeakMap;function cm(e,t){return Ff[t.type].power?sm.get(e)?.get(t.id)??0:1}function lm(e,t){let n=Ff[t.type];if(!n.power)return 0;if(t.type===`sprinkler`)return Kp(e,t)?zf.sprinklerNearWater:zf.sprinklerFar;if(t.type===`pad`)return t.drone.phase===`home`?0:n.power;let r=em(t);return r&&(t.progress!==null&&t.progress!==void 0||!tm(t,r)&&!nm(t,r))?n.power:0}function um(e,t,n,r){switch(t.type){case`solar`:return zf.solar*n;case`turbine`:return zf.turbine*r*Gp(e,t);case`digester`:return t.progress!==null&&t.progress!==void 0?zf.digester:0;default:return 0}}function dm(e,t,n,r){let i=new Map;for(let a of jp(e).list){let o=0,s=0,c=0,l=0,u=[];for(let r of a.members)o+=um(e,r,t,n),s+=lm(e,r),r.type===`battery`&&(u.push(r),c+=r.charge,l+=zf.battery.capacity);let d=1;if(o>=s){let e=(o-s)*r;for(let t of u){let n=Math.min(e,zf.battery.rate*r,zf.battery.capacity-t.charge);t.charge+=n,e-=n}}else{let e=(s-o)*r,t=0;for(let n of u){let i=Math.min(e,zf.battery.rate*r,n.charge);n.charge-=i,e-=i,t+=i}d=s>0?Math.min(1,(o+t/r)/s):1,d>.999&&(d=1)}a.made=o,a.wanted=s,a.share=d,a.stored=u.reduce((e,t)=>e+t.charge,0),a.capacity=l;for(let e of a.members)i.set(e.id,d)}sm.set(e,i)}var fm=Math.round(1/Vf.spacing);function pm(e,t,n){if(e.rot===ap(n))return!1;let r=e.items;if(e.rot===n){let e=r[r.length-1];return e&&e.pos<Vf.spacing||r.length>=fm?!1:(r.push({item:t,pos:0,step:Am}),!0)}let i=.5;if(r.length>=fm||r.some(e=>Math.abs(e.pos-i)<Vf.spacing))return!1;let a=r.findIndex(e=>e.pos<i);return r.splice(a<0?r.length:a,0,{item:t,pos:i,step:Am}),!0}var mm=e=>e.type===`splitter`||e.type===`sorter`||e.type===`crossing`;function hm(e,t,n,r,i){let a=xp(e,t,n);if(!a)return!1;if(a.type===`belt`)return pm(a,r,i);if(mm(a)){let e=ap(i);if(a.type===`crossing`){if(a.transit.some(t=>t.from%2==e%2))return!1}else if(a.transit.length>=1)return!1;return a.transit.push({item:r,from:e,t:Hf,step:Am}),!0}return im(e,a,r)}function gm(e,t,n){let r=t.items;if(!r.length){t.status=`idle`;return}let i=Vf.speed*n,a=xp(e,t.x+rp[t.rot],t.y+ip[t.rot]),o=a?.type===`belt`&&a.rot===t.rot?a.items[a.items.length-1]:void 0,s=o?Math.min(1,o.pos+1-Vf.spacing):1;for(let e=0;e<r.length;e++){let t=r[e];if(t.step===Am)continue;let n=e===0?s:r[e-1].pos-Vf.spacing;t.pos=Math.max(t.pos,Math.min(t.pos+i,n))}let c=r[0];c.pos>=1&&hm(e,t.x+rp[t.rot],t.y+ip[t.rot],c.item,t.rot)&&r.shift(),t.status=r.length&&r[0].pos>=1&&r.length*Vf.spacing>=1?`blocked`:`ok`}function _m(e,t,n){let r=t.transit;for(let i=0;i<r.length;i++){let a=r[i];if(a.step!==Am&&(a.t-=n),a.t>0)continue;let o=ap(a.from),s;s=t.type===`crossing`?[o]:t.type===`sorter`?t.filter&&a.item===t.filter?[t.rot]:t.filter?[op(t.rot),sp(t.rot)]:[t.rot]:[0,1,2,3].filter(e=>e!==a.from),s.sort((e,t)=>e-t);let c=s.length,l=s.findIndex(e=>e>=t.turn);for(let n=0;n<c;n++){let o=s[((l<0?0:l)+n)%c];if(hm(e,t.x+rp[o],t.y+ip[o],a.item,o)){t.turn=(o+1)%4,r.splice(i,1),i--;break}}}t.status=r.some(e=>e.t<=0)?`blocked`:r.length?`ok`:`idle`}function vm(e,t){let n=Hp(e,t);if(!n.length)return;let r=ym(t);if(r.length)for(let e=0;e<n.length;e++){let{belt:i,side:a}=n[((t.turn??0)+e)%n.length];for(let e=0;e<r.length;e++){let n=r[((t.turn??0)+e)%r.length];if(bm(t,n)&&pm(i,n,a)){xm(t,n),t.turn=((t.turn??0)+1)%997;break}}}}function ym(e){return e.type===`field`?e.stored>0?[e.harvest??e.crop]:[]:e.type===`hive`?e.stored>0?[`honey`]:[]:e.type===`pad`?e.mode===`receive`&&e.store.length?[e.store[0]]:[]:e.outputs?Object.keys(e.outputs).filter(t=>e.outputs[t]>0):[]}function bm(e,t){return e.type===`field`||e.type===`hive`?e.stored>0:e.type===`pad`?e.store.length>0&&e.store[0]===t:(e.outputs?.[t]??0)>0}function xm(e,t){if(e.type===`field`||e.type===`hive`){e.stored--,e.stored||(e.harvest=e.crop);return}if(e.type===`pad`){e.store.shift();return}--e.outputs[t],e.outputs[t]||delete e.outputs[t]}function Sm(e,t,n){let r=em(t),i=Ff[t.type],a=cm(e,t);if(t.progress===null||t.progress===void 0){let e=tm(t,r),n=nm(t,r);if(e){t.status=`input`,t.need=$p(e);return}if(n){t.status=`blocked`,t.need=Df[n.item].name.toLowerCase();return}if(i.power&&a<=0){t.status=`power`,t.need=void 0;return}rm(t,r),t.progress=0}let o=i.power?a:1;if(t.progress+=n*o,t.status=o<=0?`power`:o<1?`lowpower`:`ok`,t.need=void 0,t.progress>=r.time){for(let n of r.outputs)t.outputs[n.item]=(t.outputs[n.item]??0)+n.n,om(e,n.item,n.n);t.progress=null}}function Cm(e,t,n){let r=jf[t.crop];t.compost>0&&qp(e,t)<Mf.compostBelow&&(t.compost--,Jp(e,t,Mf.compostGain));let i=r.flowers&&Wp(e,t)?1:0;if(t.stored>0&&(t.harvest??t.crop)!==t.crop||t.stored+r.yield+i>Mf.store){t.status=`blocked`,t.need=jf[t.harvest??t.crop].name.toLowerCase();return}let a=Xp(e,t);t.growth+=n*a.pace/r.grow,t.status=a.water<1?`dry`:`ok`,t.need=void 0,t.growth>=1&&(t.growth=0,t.stored+=r.yield+i,t.harvest=t.crop,om(e,t.crop,r.yield+i),Jp(e,t,r.soil))}function wm(e,t){return Math.min(Bf.maxFlowers,(Rp(e).flowers.get(t.id)??[]).filter(e=>jf[e.crop].flowers).length)}function Tm(e,t,n){let r=wm(e,t);if(!r){t.status=`flowers`;return}if(t.stored>=Bf.store){t.status=`blocked`,t.need=`honey`;return}t.growth+=n*r/Bf.honeySeconds,t.status=`ok`,t.growth>=1&&(t.growth=0,t.stored++,om(e,`honey`,1))}function Em(e,t){let n=t.link?Sp(e,t.link):null;return!n||!(n.type===`depot`||n.type===`pad`&&n.mode===`receive`)?null:Dm(t,n)<=Uf.range?n:null}function Dm(e,t){let n=wp(e),r=wp(t);return Math.hypot(n.x-r.x,n.y-r.y)}function Om(e,t,n){if(t.mode===`receive`){t.status=t.store.length>=Uf.receiveStore?`blocked`:t.store.length?`ok`:`idle`,t.need=t.status===`blocked`?`its goods`:void 0;return}let r=t.drone,i=cm(e,t),a=r.target?Sp(e,r.target):null,o=a?Math.max(1,Dm(t,a)):1;switch(r.phase){case`home`:{let i=Em(e,t);if(!i){t.status=`nolink`;return}if(!t.store.length){t.status=`input`,t.need=`goods to send`,t.waited=0;return}if(t.waited+=n,t.store.length<Uf.cargo&&t.waited<Uf.waitSeconds){t.status=`ok`;return}r.cargo=t.store.splice(0,Uf.cargo),r.phase=`out`,r.t=0,r.target=i.id,t.waited=0,t.status=`ok`;return}case`out`:if(!a){r.phase=`back`;return}r.t+=n*Uf.speed*i/o,t.status=i<=0?`power`:i<1?`lowpower`:`ok`,r.t>=1&&(r.t=1,r.phase=`hover`);return;case`hover`:if(!a||!(a.type===`depot`||a.type===`pad`&&a.mode===`receive`)){r.phase=`back`,r.t=0;return}if(a.type===`depot`){for(let t of r.cargo)am(e,t);r.cargo=[]}else a.store.length+r.cargo.length<=Uf.receiveStore&&(a.store.push(...r.cargo),r.cargo=[]);if(r.cargo.length){t.status=`blocked`,t.need=`room at the receiving pad`;return}r.phase=`back`,r.t=0;return;case`back`:r.t+=n*Uf.speed*Math.max(i,+!a)/o,t.status=i<=0?`power`:`ok`,(r.t>=1||!a)&&(r.cargo.length&&(t.store.unshift(...r.cargo),r.cargo=[]),r.phase=`home`,r.t=0,r.target=0);return}}function km(e,t,n=1/0){e.carry+=t;let r=0;for(;e.carry>=.1-1e-9&&r<n;)jm(e),e.carry-=Kf,r++;r>=n&&(e.carry=0)}var Am=0;function jm(e){Am++;let t=Kf;e.time+=t;let n=Fp(e.scenario,e.time);dm(e,n,Ip(e.scenario,e.time),t);let r=[];for(let i of e.buildings)switch(i.type){case`belt`:case`splitter`:case`sorter`:case`crossing`:case`depot`:break;case`field`:Cm(e,i,t);break;case`hive`:Tm(e,i,t);break;case`pad`:Om(e,i,t);break;case`sprinkler`:case`battery`:case`pylon`:case`solar`:case`turbine`:{let t=i.type===`pylon`?null:Mp(e,i);if(i.type!==`pylon`&&!t){i.status=`nolink`;break}if(i.type===`sprinkler`){let t=cm(e,i);i.status=t<=0?`power`:t<1?`lowpower`:`ok`}else i.status=i.type===`solar`?n>0?`ok`:`idle`:`ok`;break}case`sapling`:i.age+=t,i.status=`ok`,i.age>=60&&r.push(i);break;default:i.recipe&&(Sm(e,i,t),i.type===`digester`&&!Mp(e,i)&&i.status===`ok`&&(i.status=`nolink`))}for(let t of r)vp(e,t),e.map.terrain[bp(e,t.x,t.y)]=ep.tree;r.length&&_p(e);for(let t of e.buildings)t.type!==`belt`&&!mm(t)&&vm(e,t);for(let n of e.buildings)mm(n)&&_m(e,n,t);for(let n of Rp(e).belts)gm(e,n,t);Math.floor(e.time+1e-6)!==Math.floor(e.time-t+1e-6)&&Mm(e),Nm(e),Lm(e)}function Mm(e){let t=Rp(e).fielded,n=e.map.fertility,r=e.soilBase;for(let e=0;e<n.length;e++)n[e]<r[e]&&!t.has(e)&&(n[e]=Math.min(r[e],n[e]+Mf.rest))}function Nm(e){let t=e.stats;Fm(e),e.time-t.since>=10&&(t.since+=10,t.made.unshift({}),t.made.length>7&&(t.made.length=7))}function Pm(e,t,n){if(n===`delivered`){let n=e.stats.delivered[t]??[],r=e.time-60,i=0;for(let e of n)e>r&&i++;let a=Math.min(e.time,60);return a>0?i/a*60:0}let r=e.stats.made,i=e.time-e.stats.since,a=0;r.forEach((e,n)=>{let r=e[t]??0;a+=n===6?r*Math.max(0,1-i/10):r});let o=Math.min(e.time,60);return o>0?a/o*60:0}function Fm(e){let t=e.time-60;for(let n of Object.values(e.stats.delivered)){let e=0;for(;e<n.length&&n[e]<=t;)e++;e&&n.splice(0,e)}}function Im(e,t){let n=e.scenario.goals[t];return n.kind===`deliver`?(e.delivered[n.item]??0)>=n.n:n.kind===`rate`?e.reached[t]:Yp(e)>=n.min}function Lm(e){let t=e.scenario.goals;t.forEach((t,n)=>{t.kind===`rate`&&!e.reached[n]&&e.time>=60&&Pm(e,t.item,`delivered`)>=t.perMin&&(e.reached[n]=!0)}),e.completedAt===null&&t.length&&t.every((t,n)=>Im(e,n))&&(e.completedAt=e.time)}function Rm(e,t){return t<=e?`gold`:t<=e*1.5?`silver`:`bronze`}function zm(e,t){let n=Ff[t.type];switch(t.status){case`input`:return`Waiting for ${t.need??`goods`}`;case`blocked`:return`Output blocked: nowhere for ${t.need??`its goods`} to go`;case`power`:return Mp(e,t)?`No power: the network is out of power`:`No power: not in reach of a pylon`;case`lowpower`:return`Low power: running at ${Math.round(cm(e,t)*100)}%`;case`nolink`:return t.type===`pad`?`Not linked: select it and link it to a receiving pad or the depot`:`Not connected: no pylon in reach`;case`flowers`:return`No flowering fields within 4 tiles`;case`idle`:return t.type===`solar`?`Night: no sun`:t.type===`belt`?`Empty`:`Idle`;case`dry`:return`Growing ${jf[t.crop].name.toLowerCase()} slowly: no water`;case`ok`:return t.type===`field`?`Growing ${jf[t.crop].name.toLowerCase()}`:t.recipe?`Working`:n.name}}var Bm=e=>({ok:!0,message:e}),Vm=e=>({ok:!1,message:e}),Hm=(e,t)=>e.scenario.sandbox?0:Ff[t].cost;function Um(e,t,n,r){let i=Ff[t];if(!i.category)return Vm(`The ${i.name.toLowerCase()} can't be built.`);for(let a=r;a<r+i.size;a++)for(let r=n;r<n+i.size;r++){if(!yp(e,r,a))return Vm(`Off the edge of the map.`);let n=Cp(e,r,a);if(n===ep.tree)return Vm(`A tree is in the way. Remove it first (X).`);if(n===ep.rock)return Vm(`Rock is in the way. Remove it first (X).`);if(n===ep.water&&!i.onWater)return Vm(`The ${i.name.toLowerCase()} can't stand on water.`);let o=xp(e,r,a);if(o&&(t!==`belt`||o.type!==`belt`))return Vm(`The ${Ff[o.type].name.toLowerCase()} is in the way.`)}return e.credits<Hm(e,t)?Vm(`Not enough credits: the ${i.name.toLowerCase()} costs ${Hm(e,t)}.`):Bm(``)}function Wm(e,t,n,r,i){let a=xp(e,n,r);if(t===`belt`&&a?.type===`belt`)return a.rot===i?Vm(``):(a.rot=i,_p(e),{...Bm(`Belt turned.`),building:a});let o=Um(e,t,n,r);if(!o.ok)return o;let s=lp(e,t,n,r,i);return e.credits-=Hm(e,t),gp(e,s),{...Bm(`Built a ${Ff[t].name.toLowerCase()}.`),building:s}}function Gm(e,t,n){let r=[];if(e.x===t.x&&e.y===t.y)return[{...e,rot:n}];let i=Math.sign(t.x-e.x),a=Math.sign(t.y-e.y),o=i>0?1:3,s=a>0?2:0,c=e.x,l=e.y;for(;c!==t.x;)r.push({x:c,y:l,rot:o}),c+=i;for(;l!==t.y;)r.push({x:c,y:l,rot:a?s:o}),l+=a;return r.push({x:c,y:l,rot:a?s:o}),r}function Km(e,t){return t.type===`depot`?Vm(`The depot stays: it's where the commission is delivered.`):e.buildings.includes(t)?(vp(e,t),e.credits+=Hm(e,t.type),Bm(`Removed the ${Ff[t.type].name.toLowerCase()} (refunded).`)):Vm(``)}function qm(e,t,n){if(!yp(e,t,n))return Vm(``);let r=xp(e,t,n);if(r)return Km(e,r);let i=Cp(e,t,n);if(i!==ep.tree&&i!==ep.rock)return Vm(``);let a=i===ep.tree?`tree`:`rock`,o=e.scenario.sandbox?0:Wf[a];return e.credits<o?Vm(`Clearing a ${a} costs ${o} credits.`):(e.credits-=o,e.map.terrain[bp(e,t,n)]=ep.grass,_p(e),Bm(a===`tree`?`Cleared a tree (${o} credits). Fewer trees: soil health falls a little.`:`Cleared rock (${o} credits).`))}function Jm(e,t){return t.rot=(t.rot+1)%4,_p(e),Bm(``)}function Ym(e,t){return e.type!==`field`||e.crop===t?Vm(``):(e.crop=t,e.growth=0,Bm(`The field now grows ${jf[t].name.toLowerCase()}${e.stored?` (once its ${jf[e.harvest??t].name.toLowerCase()} harvest has gone)`:``}.`))}function Xm(e,t){if(e.recipe===t)return Vm(``);let n=Rf(t);return!n||n.building!==e.type?Vm(``):e.progress!==null&&e.progress!==void 0?Vm(`Wait for the batch in progress to finish.`):(e.recipe=t,e.progress=null,Bm(`Now making ${Df[n.outputs[0].item].name.toLowerCase()}.`))}function Zm(e,t){return e.type===`sorter`?(e.filter=t,Bm(t?`${Df[t].name} goes straight on; the rest go left or right.`:`Everything goes straight on.`)):Vm(``)}function Qm(e,t){return e.type!==`pad`||e.mode===t?Vm(``):e.drone&&e.drone.phase!==`home`?Vm(`Wait for the drone to come home.`):(e.mode=t,t===`receive`&&(e.link=null),Bm(t===`send`?`The pad sends: link it to a receiving pad or the depot.`:`The pad receives goods from sending pads.`))}function $m(e,t,n){if(t.type!==`pad`||t.mode!==`send`)return Vm(`Only a sending pad links.`);if(n===t)return Vm(`A pad can't send to itself.`);if(!(n.type===`depot`||n.type===`pad`&&n.mode===`receive`))return Vm(`Link to a receiving pad or the depot.`);let r=Dm(t,n);return r>Uf.range?Vm(`Too far: ${Math.round(r)} tiles (drones reach ${Uf.range}).`):(t.link=n.id,Bm(`Linked: ${Math.round(r)} tiles.`))}var eh=`soil-n-silo/v2`;function th(e){let t=e.replace(/[^/]*$/,``);return t===`/`?eh:`${eh}@${t}`}var nh=e=>JSON.stringify(e);function rh(e){if(!e)return null;try{let t=JSON.parse(e);return t?.version===1&&hh(t)?t:null}catch{return null}}var ih=e=>typeof e==`number`&&Number.isFinite(e),ah=e=>!!e&&typeof e==`object`&&Object.values(e).every(ih),oh=Array.isArray,sh=e=>typeof e==`string`&&e in Df,ch=e=>oh(e)&&e.every(sh),lh=e=>ah(e)&&Object.keys(e).every(sh),uh=e=>typeof e==`string`&&e in jf,dh=e=>e===0||e===1||e===2||e===3,fh=e=>!!e&&(e.kind===`deliver`&&sh(e.item)&&ih(e.n)||e.kind===`rate`&&sh(e.item)&&ih(e.perMin)||e.kind===`soil`&&ih(e.min)),ph=e=>typeof e==`string`;function mh(e){let t=e?.weather,n=e?.terrain;return!!e&&ph(e.id)&&ph(e.name)&&ph(e.blurb)&&[e.seed,e.width,e.height,e.credits,e.par].every(ih)&&oh(e.tags)&&e.tags.every(ph)&&(e.tips===void 0||oh(e.tips)&&e.tips.every(ph))&&oh(e.goals)&&e.goals.every(fh)&&!!t&&[t.sunrise,t.sunset,t.sun,t.wind,t.gust].every(ih)&&!!n&&[n.soil,n.soilSpread,n.forest,n.rock].every(ih)&&[`river`,`ponds`,`lake`,`none`].includes(n.water)}function hh(e){let t=e.map,n=e.stats;return mh(e.scenario)&&!!t&&ih(t.width)&&ih(t.height)&&oh(t.terrain)&&t.terrain.length===t.width*t.height&&oh(t.fertility)&&t.fertility.length===t.width*t.height&&t.fertility.every(ih)&&oh(e.soilBase)&&e.soilBase.length===t.fertility.length&&e.soilBase.every(ih)&&!!t.depot&&ih(t.depot.x)&&ih(t.depot.y)&&[e.credits,e.time,e.carry,e.nextId,e.earned,e.initialTrees].every(ih)&&(e.completedAt===null||ih(e.completedAt))&&lh(e.delivered)&&lh(e.made)&&oh(e.reached)&&e.reached.length===e.scenario.goals.length&&!!n&&ih(n.since)&&oh(n.made)&&n.made.length>0&&n.made.every(lh)&&!!n.delivered&&typeof n.delivered==`object`&&Object.entries(n.delivered).every(([e,t])=>sh(e)&&oh(t)&&t.every(ih))&&oh(e.buildings)&&e.buildings.every(e=>gh(e,t.width,t.height))}function gh(e,t,n){if(!e||!ih(e.id)||!ih(e.x)||!ih(e.y)||!(e.type in Ff)||!dh(e.rot))return!1;let r=Ff[e.type].size;if(e.x<0||e.y<0||e.x+r>t||e.y+r>n)return!1;switch(e.type){case`belt`:return oh(e.items)&&e.items.every(e=>e&&ih(e.pos)&&sh(e.item));case`splitter`:case`crossing`:case`sorter`:return oh(e.transit)&&e.transit.every(e=>e&&sh(e.item)&&dh(e.from)&&ih(e.t))&&ih(e.turn)&&(e.type!==`sorter`||e.filter===null||sh(e.filter));case`field`:return uh(e.crop)&&(e.harvest===void 0||uh(e.harvest))&&ih(e.growth)&&ih(e.stored)&&ih(e.compost);case`hive`:return ih(e.growth)&&ih(e.stored);case`battery`:return ih(e.charge);case`pad`:return(e.mode===`send`||e.mode===`receive`)&&(e.link===null||ih(e.link))&&ch(e.store)&&ih(e.waited)&&!!e.drone&&[`home`,`out`,`back`,`hover`].includes(e.drone.phase)&&ih(e.drone.t)&&ch(e.drone.cargo)&&ih(e.drone.target);case`sapling`:return ih(e.age)}return!Lf(e.type).length||Lf(e.type).some(t=>t.id===e.recipe)&&lh(e.inputs)&&lh(e.outputs)&&(e.progress===null||ih(e.progress))}function _h(e){try{let t=JSON.parse(e??`{}`);return t&&typeof t==`object`?t:{}}catch{return{}}}var vh={gold:3,silver:2,bronze:1};function yh(e,t,n,r){let i=e[t];return!i||vh[n]>vh[i.medal]||vh[n]===vh[i.medal]&&r<i.time?{...e,[t]:{medal:n,time:r}}:e}var bh={sunrise:6,sunset:20,sun:1,wind:.5,gust:.35},xh={soil:60,soilSpread:25,water:`river`,forest:.12,rock:.04},Sh=60,Ch=[{id:`c1`,name:`First Light`,seed:1101,width:44,height:36,credits:1200,par:1200,blurb:`Brightwater needs grain and flour to get through the season. Lay your first fields, belts and a powered mill.`,terrain:{...xh,forest:.08,rock:.02},weather:bh,tags:[`Gentle`],goals:[{kind:`deliver`,item:`wheat`,n:120},{kind:`deliver`,item:`flour`,n:80}],tips:[`Place a few fields (F) on rich soil (V shows it) and run a belt (B) along one side of them: the harvest drops onto it.`,`Lead the belt into the depot for wheat. For flour, lead a belt into a mill, and another out of the mill into the depot.`,`The mill needs power: a solar panel (S) and a pylon (P) within 3 tiles of both. A battery keeps it going at night.`,`Sprinklers near the fields more than double their pace. Watch the markers: yellow waits for input, red has no power.`]},{id:`c2`,name:`Morning Bread`,seed:2202,width:48,height:40,credits:1600,par:2100,blurb:`Fresh bread for the schoolhouse. Chickens need feed, the mill makes bran: close the loop, and keep the soil alive.`,terrain:xh,weather:bh,tags:[],goals:[{kind:`deliver`,item:`bread`,n:150},{kind:`soil`,min:40}],tips:[`Bread is flour and an egg. Chickens lay eggs from feed: beans, bran or seed cake, and leave manure.`,`A mill makes bran with every flour. A sorter can send the flour one way and the bran another.`,`Anything a building can't get rid of stops it: send spare bran and manure to a composter, a digester or the depot.`,`Wheat tires the soil; bean fields and compost bring it back.`]},{id:`c3`,name:`Windy Ridge`,seed:3303,width:48,height:40,credits:1100,par:2400,blurb:`The ridge co-op cooks with sunflower oil, but the sun is weak up here. The wind never stops, though.`,terrain:{...xh,water:`ponds`,rock:.12,forest:.06},weather:{...bh,sun:.6,wind:.75,gust:.25},tags:[`Weak sun`,`Strong wind`,`Rocky`],goals:[{kind:`deliver`,item:`oil`,n:90},{kind:`deliver`,item:`bread`,n:80}]},{id:`c4`,name:`Linen for the Looms`,seed:4404,width:50,height:40,credits:1300,par:3e3,blurb:`The weavers of Hollin want linen, and a steady supply of yarn for their own looms.`,terrain:xh,weather:bh,tags:[],goals:[{kind:`deliver`,item:`linen`,n:50},{kind:`rate`,item:`yarn`,perMin:5}]},{id:`c5`,name:`Long Nights`,seed:5505,width:48,height:40,credits:1400,par:2700,blurb:`Late autumn: short days and long nights. The midwinter fair wants honey cake.`,terrain:{...xh,water:`lake`},weather:{...bh,sunrise:8,sunset:17,wind:.45},tags:[`Short days`],goals:[{kind:`deliver`,item:`honeycake`,n:60}]},{id:`c6`,name:`Tired Soil`,seed:6606,width:48,height:40,credits:1400,par:2700,blurb:`Years of monoculture left this valley worn out. Make sauce for the cannery town, and leave the soil better than you found it.`,terrain:{...xh,soil:28,soilSpread:15,forest:.05},weather:bh,tags:[`Poor soil`],goals:[{kind:`deliver`,item:`sauce`,n:50},{kind:`soil`,min:55}]},{id:`c7`,name:`Riverlands`,seed:7707,width:52,height:42,credits:1600,par:3300,blurb:`Three villages along the river put in orders at once. Space is short between the water and the woods.`,terrain:{...xh,water:`river`,forest:.22,rock:.06},weather:bh,tags:[`Cramped`,`Wet`],goals:[{kind:`deliver`,item:`linen`,n:30},{kind:`deliver`,item:`sauce`,n:30},{kind:`deliver`,item:`bread`,n:80}]},{id:`c8`,name:`Harvest Festival`,seed:8808,width:56,height:44,credits:1800,par:3600,blurb:`The whole valley comes together for the festival. Everything, at once, on healthy soil.`,terrain:{...xh,soil:50,rock:.07,forest:.14},weather:{...bh,sunset:19,wind:.55},tags:[`Everything`],goals:[{kind:`deliver`,item:`honeycake`,n:40},{kind:`deliver`,item:`sauce`,n:30},{kind:`deliver`,item:`linen`,n:30},{kind:`soil`,min:60}]}],wh={id:`sandbox`,name:`Sandbox`,seed:4242,width:64,height:52,credits:1e6,par:0,sandbox:!0,blurb:`A big calm valley with unlimited credits and no goals, for trying things out.`,terrain:{...xh,forest:.08,rock:.03},weather:bh,tags:[`No goals`,`Unlimited credits`],goals:[]},Th=[{item:`flour`,n:60,level:1},{item:`oil`,n:40,level:1},{item:`yarn`,n:50,level:1},{item:`egg`,n:60,level:1},{item:`bread`,n:60,level:2},{item:`linen`,n:25,level:2},{item:`honey`,n:40,level:2},{item:`sauce`,n:25,level:3},{item:`honeycake`,n:25,level:3}],Eh=[`Brook`,`Fern`,`Sun`,`Willow`,`Clover`,`Amber`,`Moss`,`Hazel`,`Reed`,`Linden`,`Bramble`,`Heather`],Dh=[`hollow`,`field`,`stead`,`mere`,`vale`,`ridge`,`ford`,`wick`,`down`,`combe`];function Oh(e,t){let n=qf(e^t*2654435769),r=e=>e[Math.floor(n()*e.length)],i=`${r(Eh)}${r(Dh)}`,a=[],o={...bh},s={...xh,water:r([`river`,`ponds`,`lake`,`river`])},c=[()=>{o.sun=.6,o.wind=.75,a.push(`Weak sun`,`Strong wind`)},()=>{o.sunrise=8,o.sunset=17,a.push(`Short days`)},()=>{s.soil=30,s.soilSpread=15,a.push(`Poor soil`)},()=>{s.rock=.12,a.push(`Rocky`)},()=>{s.forest=.24,a.push(`Wooded`)},()=>{o.wind=.25,o.gust=.2,a.push(`Still air`)}],l=Math.min(t,2)-+(n()<.4),u=new Set;for(;u.size<l;)u.add(Math.floor(n()*c.length));for(let e of u)c[e]();let d=Th.filter(e=>e.level<=t),f=Math.min(4,1+t+ +(n()<.5)),p=n()<.4+.2*t,m=f-+!!p,h=[],g=new Set;for(;h.length<m&&g.size<d.length;){let e=r(d);g.has(e.item)||(g.add(e.item),h.push({kind:`deliver`,item:e.item,n:Math.round(e.n*(.8+.2*t)/5)*5}))}p&&h.push({kind:`soil`,min:40+5*t});let _=(15+12*t+6*h.length)*Sh;return{id:`r${e}-${t}`,name:i,seed:e,width:44+4*t,height:36+3*t,blurb:`A commission from ${i}: ${h.filter(e=>e.kind===`deliver`).map(e=>Df[e.item].name.toLowerCase()).join(`, `)}.`,terrain:s,weather:o,credits:1e3+200*t,goals:h,par:_,tags:[`Difficulty ${t}`,...a]}}function kh(e){if(e===wh.id)return wh;let t=Ch.find(t=>t.id===e);if(t)return t;let n=/^r(\d+)-([123])$/.exec(e);return n?Oh(Number(n[1]),Number(n[2])):null}function Q(e,t=null,...n){let r=document.createElement(e);for(let[e,n]of Object.entries(t??{}))n!=null&&n!==!1&&(e.startsWith(`on`)?r.addEventListener(e.slice(2),n):e===`style`?r.setAttribute(`style`,String(n)):e===`class`?r.className=String(n):e in r?r[e]=n:r.setAttribute(e,String(n)));for(let e of n.flat())e!=null&&e!==!1&&r.append(e instanceof Node?e:String(e));return r}var Ah=e=>{let t=Math.floor(e/60),n=Math.floor(e%60);return`${t}:${String(n).padStart(2,`0`)}`},jh=e=>`${e>=100?Math.round(e):e.toFixed(1).replace(/\.0$/,``)} W`,Mh={gold:`Gold`,silver:`Silver`,bronze:`Bronze`},Nh=(e,t)=>Q(`span`,{class:`good`},Q(`i`,{style:`background:#${Df[e].colour.toString(16).padStart(6,`0`)}`}),t===void 0?``:`${t} `,Df[e].name.toLowerCase()),Ph=e=>`item`in e?Nh(e.item,e.n):Q(`span`,{class:`good`},`${e.n} `,kf[e.group].split(` (`)[0]),Fh=(e,t,n={})=>Q(`button`,{class:[n.primary?`primary`:``,n.active?`active`:``,n.cls??``].join(` `).trim(),disabled:!!n.disabled,title:n.title,onclick:e=>{e.stopPropagation(),t()}},e);function Ih(e,t){e.textContent!==t&&(e.textContent=t)}var Lh=()=>{let e=Q(`div`,{class:`fill`});return{el:Q(`div`,{class:`bar`},e),set:t=>{e.style.width=`${Math.max(0,Math.min(1,t))*100}%`}}},Rh=class{host;root;top={name:Q(`b`),clock:Q(`span`),medal:Q(`span`,{class:`medal-pace`}),credits:Q(`b`),day:Q(`span`),sun:Q(`span`),wind:Q(`span`),power:Q(`span`),battery:Lh()};speedButtons=[];overlayButtons=new Map;goals=Q(`div`,{class:`card goals`});goalRows=[];buildbar=Q(`div`,{class:`buildbar card`});category=Pf[0].id;buildKey=``;buildButtons=new Map;info=Q(`div`,{class:`info`});inspector=Q(`div`,{class:`card inspector`});inspectKey=``;inspectUpdate=null;toasts=Q(`div`,{class:`toasts`});layer=Q(`div`,{class:`layer`});modals=[];statsOpen=!1;statsBody=Q(`div`);stats=Q(`div`,{class:`card stats-panel`},Q(`div`,{class:`head`},Q(`b`,null,`Production (last minute)`),Fh(`✕`,()=>this.toggleStats(),{cls:`close`})),this.statsBody);lastSlow=0;constructor(e,t){this.host=t,this.root=e;let n=this.top,r=Q(`div`,{class:`card commission`},Q(`div`,null,n.name),Q(`div`,{class:`line`},`⏱ `,n.clock,` `,n.medal),Q(`div`,{class:`line`},`◈ `,n.credits,` credits`)),i=Q(`div`,{class:`card weather`},Q(`div`,{class:`line`},n.day,` · ☀ `,n.sun,` · ༄ `,n.wind),Q(`div`,{class:`line`},`⚡ `,n.power),Q(`div`,{class:`line battery`,title:`Stored power across all batteries`},`▮ `,n.battery.el)),a=Q(`div`,{class:`buttons`},...[[0,`⏸`,`Pause (Space)`],[1,`1×`,`Normal speed (1)`],[2,`2×`,`Double speed (2)`],[4,`4×`,`Fast (3)`]].map(([e,n,r])=>{let i=Fh(String(n),()=>t.setSpeed(Number(e)),{title:String(r)});return this.speedButtons.push(i),i})),o=Q(`div`,{class:`buttons`},...[[`fertility`,`Soil`],[`power`,`Power`],[`water`,`Water`],[`bees`,`Bees`]].map(([e,n])=>{let r=Fh(n,()=>t.setOverlay(e),{title:`Show ${n.toLowerCase()} (V cycles)`});return this.overlayButtons.set(e,r),r})),s=Q(`div`,{class:`right-col`},Q(`div`,{class:`buttons`},a,Fh(`⟲`,()=>t.turn(-1),{title:`Turn the view (Q)`}),Fh(`⟳`,()=>t.turn(1),{title:`Turn the view (E)`}),Fh(`⌕`,()=>t.zoom(),{title:`Zoom (Z or the wheel)`}),Fh(`☰`,()=>this.openPause(),{title:`Menu (Esc)`})),o,Fh(`Stats (Tab)`,()=>this.toggleStats(),{cls:`small`})),c=Q(`div`,{class:`bottom`},this.info,this.buildbar);e.append(Q(`div`,{class:`hud`},Q(`div`,{class:`top`},r,i,s),this.goals,this.inspector,this.stats,c,this.toasts),this.layer),this.buildGoals(),this.refresh()}get modal(){return this.modals.some(e=>e.blocking)}update(){let e=this.host.state(),t=performance.now();this.speedButtons.forEach((e,t)=>e.classList.toggle(`active`,[0,1,2,4][t]===this.host.speed()));for(let[e,t]of this.overlayButtons)t.classList.toggle(`active`,this.host.overlay()===e);if(this.syncBuildbar(),t-this.lastSlow<150)return;this.lastSlow=t;let n=this.top,r=e.scenario;Ih(n.name,r.name);let i=e.completedAt;Ih(n.clock,r.sandbox?Ah(e.time):i===null?`${Ah(e.time)} / ${Ah(r.par)}`:`${Ah(i)} · done`);let a=r.sandbox?null:Rm(r.par,i??e.time);Ih(n.medal,a?i===null?`${Mh[a]} pace`:Mh[a]:``),n.medal.className=`medal-pace ${a??``}`,Ih(n.credits,r.sandbox?`∞`:Math.floor(e.credits).toLocaleString()),Ih(n.day,`Day ${Pp(e.time)}, ${Tf(Np(e.time))}`),Ih(n.sun,`${Math.round(Fp(r,e.time)*100)}%`),Ih(n.wind,`${Math.round(Ip(r,e.time)*100)}%`);let o=jp(e).list,s=o.reduce((e,t)=>e+t.made,0),c=o.reduce((e,t)=>e+t.wanted,0),l=o.reduce((e,t)=>e+t.stored,0),u=o.reduce((e,t)=>e+t.capacity,0),d=o.reduce((e,t)=>Math.min(e,t.share),1);Ih(n.power,o.length?`${jh(s)} made · ${jh(c)} used${d<1?` · short (${Math.round(d*100)}%)`:``}`:`No pylons yet`),n.power.className=d<1?`warn`:``,n.battery.set(u?l/u:0),this.updateGoals(),this.inspect(),this.statsOpen&&this.renderStats()}setHover(e){Ih(this.info,e??``),this.info.style.visibility=e?`visible`:`hidden`}toast(e,t=!0){let n=Q(`div`,{class:`toast${t?``:` bad`}`},e);for(this.toasts.append(n);this.toasts.children.length>4;)this.toasts.firstChild.remove();setTimeout(()=>n.classList.add(`gone`),2200),setTimeout(()=>n.remove(),2800)}refresh(){this.buildKey=``,this.inspectKey=``,this.lastSlow=0}buildGoals(){let e=this.host.state();this.goals.replaceChildren(Q(`div`,{class:`title`},e.scenario.sandbox?`Sandbox`:`Commission`)),this.goalRows=e.scenario.goals.map(()=>{let e=Q(`div`),t=Lh(),n=Q(`div`,{class:`goal`},e,t.el);return this.goals.append(n),{el:n,text:e,bar:t}}),e.scenario.goals.length||this.goals.append(Q(`div`,{class:`goal`},`No goals: build whatever you like.`))}updateGoals(){let e=this.host.state();e.scenario.goals.forEach((t,n)=>{let r=this.goalRows[n],i=Im(e,n);if(r.el.classList.toggle(`done`,i),t.kind===`deliver`){let n=Math.min(t.n,e.delivered[t.item]??0);Ih(r.text,`${i?`✔`:`○`} Deliver ${Df[t.item].name.toLowerCase()}: ${n} / ${t.n}`),r.bar.set(n/t.n)}else if(t.kind===`rate`){let n=Pm(e,t.item,`delivered`);Ih(r.text,`${i?`✔`:`○`} Deliver ${t.perMin} ${Df[t.item].name.toLowerCase()}/min (now ${n.toFixed(1)})`),r.bar.set(i?1:n/t.perMin)}else{let n=Yp(e);Ih(r.text,`${i?`✔`:`○`} Soil health ≥ ${t.min} at the end (now ${Math.round(n)})`),r.bar.set(n/t.min)}})}syncBuildbar(){let e=this.host.state(),t=this.host.tool(),n=JSON.stringify([this.category,t]);if(n===this.buildKey){for(let[t,n]of this.buildButtons)n.classList.toggle(`poor`,e.credits<Hm(e,t));return}this.buildKey=n,this.buildButtons.clear();let r=Q(`div`,{class:`tabs`},...Pf.map(e=>Fh(e.name,()=>{this.category=e.id,this.buildKey=``},{active:e.id===this.category})),Fh(`Remove (X)`,()=>this.host.setTool(t.kind===`remove`?{kind:`select`}:{kind:`remove`}),{active:t.kind===`remove`,cls:`danger`})),i=Q(`div`,{class:`items`},...Object.keys(Ff).filter(e=>Ff[e].category===this.category).map(n=>{let r=Ff[n],i=Hm(e,n),a=t.kind===`build`&&t.type===n,o=Fh(Q(`span`,null,Q(`b`,null,r.name),Q(`small`,null,`${i?`${i} ◈`:`free`}${r.power?` · ${r.power} W`:``}${r.key?` · ${r.key}`:``}`)),()=>this.host.setTool(a?{kind:`select`}:{kind:`build`,type:n,rot:t.kind===`build`?t.rot:1}),{active:a,title:r.hint,cls:e.credits<i?`poor`:``});return this.buildButtons.set(n,o),o}));this.buildbar.replaceChildren(r,i)}inspect(){let e=this.host.state(),t=this.host.selected(),n=t===null?null:Sp(e,t);if(!n){this.inspector.style.display!==`none`&&(this.inspector.style.display=`none`,this.inspector.replaceChildren()),this.inspectKey=``,this.inspectUpdate=null;return}let r=JSON.stringify([n.id,n.type,n.crop,n.recipe,n.filter,n.mode,n.link,n.rot,this.host.tool().kind]);if(r!==this.inspectKey){this.inspectKey=r,this.inspector.style.display=`block`;let{el:t,update:i}=this.renderInspector(e,n);this.inspector.replaceChildren(t),this.inspectUpdate=i}this.inspectUpdate?.()}renderInspector(e,t){let n=Ff[t.type],r=Q(`div`,{class:`status`}),i=[()=>{Ih(r,zm(e,t)),r.className=`status ${t.status}`}],a=[],o=(e,t)=>{let n=Q(`b`);i.push(()=>Ih(n,t())),a.push(Q(`div`,{class:`kv`},Q(`span`,null,e),n))},s=e=>{let t=Lh();i.push(()=>t.set(e())),a.push(t.el)},c=()=>{this.inspectKey=``,this.host.changed()};switch(t.type){case`field`:a.push(Q(`div`,{class:`choices`},...Af.map(e=>Fh(jf[e].name,()=>{let n=Ym(t,e);n.ok&&this.toast(n.message),c()},{active:t.crop===e,title:`${jf[e].grow} s · ${jf[e].yield} per harvest · soil ${jf[e].soil>0?`+`:``}${jf[e].soil}`})))),s(()=>t.growth),o(`Soil fertility`,()=>`${Math.round(qp(e,t))}`),o(`Growth pace`,()=>{let n=Xp(e,t);return`${Math.round(n.pace*100)}% (water ${Math.round(n.water*100)}%, soil ×${n.soil.toFixed(2)})`}),o(`Harvest`,()=>`${jf[t.crop].yield}${jf[t.crop].flowers&&Wp(e,t)?` +1 (bees)`:``} every ~${Math.round(jf[t.crop].grow/Math.max(.01,Xp(e,t).pace))} s`),o(`Waiting to go`,()=>`${t.stored} / ${Mf.store}`),o(`Compost`,()=>`${t.compost} / ${Mf.compostStore} (used below soil ${Mf.compostBelow})`);break;case`hive`:o(`Flowering fields`,()=>`${wm(e,t)} (up to ${Bf.maxFlowers})`),s(()=>t.growth),o(`Honey waiting`,()=>`${t.stored} / ${Bf.store}`);break;case`sorter`:a.push(Q(`label`,{class:`select`},`Straight on: `,Q(`select`,{onchange:e=>{Zm(t,e.target.value||null),c()}},Q(`option`,{value:``,selected:!t.filter},`everything`),...Ef.map(e=>Q(`option`,{value:e,selected:t.filter===e},Df[e].name))))),a.push(Q(`p`,{class:`hint`},`The chosen good goes straight on; every other good goes out left or right.`));break;case`pad`:if(a.push(Q(`div`,{class:`choices`},Fh(`Send`,()=>{this.padMode(t,`send`),c()},{active:t.mode===`send`}),Fh(`Receive`,()=>{this.padMode(t,`receive`),c()},{active:t.mode===`receive`}))),t.mode===`send`){let n=Em(e,t);a.push(Q(`div`,{class:`kv`},Q(`span`,null,`Sends to`),Q(`b`,null,n?`${Ff[n.type].name} (${Math.round(Dm(t,n))} tiles)`:`nothing yet`))),a.push(Fh(this.host.tool().kind===`link`?`Click the target…`:`Link to a pad or the depot`,()=>this.host.setTool({kind:`link`,pad:t.id}),{primary:!0})),o(`Drone`,()=>({home:`home`,out:`flying out`,hover:`unloading`,back:`flying back`})[t.drone.phase]),o(`Waiting to send`,()=>`${t.store.length} / ${Uf.store}`)}else o(`Waiting to go out`,()=>`${t.store.length} / ${Uf.receiveStore}`);break;case`battery`:o(`Charge`,()=>`${Math.round(t.charge)} / ${zf.battery.capacity} J`),s(()=>t.charge/zf.battery.capacity);break;case`solar`:case`turbine`:o(`Making`,()=>jh(um(e,t,Fp(e.scenario,e.time),Ip(e.scenario,e.time)))),t.type===`turbine`&&o(`Shelter`,()=>`${Math.round(Gp(e,t)*100)}% of the wind reaches it`);break;case`belt`:o(`Goods`,()=>`${t.items.length}`);break;case`depot`:{let t=Q(`div`,{class:`delivered`});i.push(()=>{let n=JSON.stringify(e.delivered);if(t.dataset.key===n)return;t.dataset.key=n;let r=Object.keys(e.delivered).filter(t=>e.delivered[t]);t.replaceChildren(...r.length?r.map(t=>Q(`div`,null,Nh(t,e.delivered[t]))):[Q(`p`,{class:`hint`},`Nothing delivered yet. Run belts into the depot, or link drone pads to it.`)])}),o(`Earned`,()=>`${Math.floor(e.earned).toLocaleString()} credits`),a.push(Q(`h4`,null,`Delivered`),t);break}}let l=em(t);if(l){let e=Lf(t.type);e.length>1&&a.unshift(Q(`div`,{class:`choices`},...e.map(e=>Fh(Df[e.outputs[0].item].name,()=>{let n=Xm(t,e.id);n.message&&this.toast(n.message,n.ok),c()},{active:t.recipe===e.id})))),a.push(Q(`div`,{class:`recipe`},...l.inputs.flatMap((e,t)=>[t?` + `:``,Ph(e)]),` → `,...l.outputs.length?l.outputs.flatMap((e,t)=>[t?` + `:``,Nh(e.item,e.n)]):[`${zf.digester} W`],Q(`small`,null,` · ${l.time} s`))),s(()=>(t.progress??0)/l.time);let n=Q(`div`,{class:`buffers`}),r=Q(`div`,{class:`buffers`});i.push(()=>{let e=l.inputs.flatMap(e=>`item`in e?[e.item]:[...Of[e.group]]),i=JSON.stringify([t.inputs,t.outputs]);n.dataset.key!==i&&(n.dataset.key=i,n.replaceChildren(Q(`span`,null,`In: `),...e.map(e=>Nh(e,t.inputs[e]??0))),r.replaceChildren(Q(`span`,null,`Out: `),...l.outputs.length?l.outputs.map(e=>Nh(e.item,t.outputs[e.item]??0)):[`power`]))}),a.push(n,r)}n.power&&o(`Power`,()=>{let n=Mp(e,t),r=lm(e,t);return n?r?`using ${jh(r)} now · getting ${Math.round(cm(e,t)*100)}%`:`none right now`:`not connected`}),(n.power||t.type===`battery`||t.type===`solar`||t.type===`turbine`||t.type===`digester`)&&o(`Network`,()=>{let n=Mp(e,t);return n?`${jh(n.made)} made · ${jh(n.wanted)} used · ${Math.round(n.stored)} J stored`:`none: no pylon in reach`});let u=Q(`div`,{class:`actions`},n.directional?Fh(`Turn (R)`,()=>{Jm(e,t),c()}):null,t.type===`depot`?null:Fh(`Remove`,()=>{let n=Km(e,t);this.toast(n.message,n.ok),this.host.select(null),c()},{cls:`danger`}));return{el:Q(`div`,null,Q(`div`,{class:`head`},Q(`b`,null,n.name),Fh(`✕`,()=>{this.host.select(null),this.refresh()},{cls:`close`,title:`Close (Esc)`})),Q(`p`,{class:`hint`},n.hint),r,...a,u),update:()=>{for(let e of i)e()}}}padMode(e,t){let n=Qm(e,t);n.message&&this.toast(n.message,n.ok)}toggleStats(){this.statsOpen=!this.statsOpen,this.stats.style.display=this.statsOpen?`block`:`none`,this.statsOpen&&this.renderStats()}renderStats(){let e=this.host.state(),t=Ef.filter(t=>e.made[t]||e.delivered[t]).map(t=>Q(`tr`,null,Q(`td`,null,Nh(t)),Q(`td`,null,Pm(e,t,`made`).toFixed(1)),Q(`td`,null,Pm(e,t,`delivered`).toFixed(1)),Q(`td`,null,String(e.made[t]??0)),Q(`td`,null,String(e.delivered[t]??0))));this.statsBody.replaceChildren(t.length?Q(`table`,null,Q(`tr`,null,Q(`th`,null,`Good`),Q(`th`,null,`Made/min`),Q(`th`,null,`Delivered/min`),Q(`th`,null,`Made`),Q(`th`,null,`Delivered`)),...t):Q(`p`,{class:`hint`},`Nothing made yet.`),Q(`div`,{class:`kv`},Q(`span`,null,`Soil health`),Q(`b`,null,String(Math.round(Yp(e))))))}openModal(e,t,n){this.modals=this.modals.filter(t=>t.name!==e),this.modals.push({name:e,el:t,blocking:n}),this.drawModals()}drawModals(){let e=this.modals[this.modals.length-1];this.layer.replaceChildren(...e?[e.el]:[]),this.layer.classList.toggle(`open`,!!e)}closeTop(){return this.modals.length?(this.modals.pop(),this.drawModals(),!0):this.statsOpen?(this.toggleStats(),!0):!1}close(e){this.modals=this.modals.filter(t=>t.name!==e),this.drawModals()}showIntro(){let e=this.host.state().scenario;this.openModal(`intro`,Q(`div`,{class:`panel`},Q(`h2`,null,e.name),Q(`p`,null,e.blurb),e.goals.length?Q(`ul`,null,...e.goals.map(e=>Q(`li`,null,e.kind===`deliver`?`Deliver ${e.n} ${Df[e.item].name.toLowerCase()} to the depot`:e.kind===`rate`?`Reach ${e.perMin} ${Df[e.item].name.toLowerCase()} per minute delivered`:`Keep soil health at ${e.min} or more`))):null,e.sandbox?null:Q(`p`,{class:`sub`},`Target time ${Ah(e.par)} for gold, ${Ah(e.par*1.5)} for silver. You can pause (Space) and build while paused.`),e.tags.length?Q(`p`,{class:`tags`},...e.tags.map(e=>Q(`span`,null,e))):null,e.tips?Q(`div`,{class:`tips`},Q(`h3`,null,`First steps`),Q(`ol`,null,...e.tips.map(e=>Q(`li`,null,e)))):null,e.tips?null:zh(),Q(`div`,{class:`actions`},Fh(`Start`,()=>this.close(`intro`),{primary:!0}))),!0)}openPause(){let e=this.host.state();this.openModal(`pause`,Q(`div`,{class:`panel`},Q(`h2`,null,e.scenario.name),zh(),Q(`div`,{class:`actions`},Fh(`Restart commission`,()=>this.confirm(`Restart this commission?`,`Everything built so far is lost.`,()=>this.host.restart())),Fh(`Level select`,()=>this.host.menu()),Fh(`Resume`,()=>this.close(`pause`),{primary:!0}))),!0)}confirm(e,t,n){this.openModal(`confirm`,Q(`div`,{class:`panel`},Q(`h2`,null,e),Q(`p`,null,t),Q(`div`,{class:`actions`},Fh(`Cancel`,()=>this.close(`confirm`)),Fh(`Yes`,n,{primary:!0}))),!0)}showComplete(e){let t=this.host.state(),n=t.scenario,r=t.completedAt??t.time;this.openModal(`done`,Q(`div`,{class:`panel done`},Q(`h2`,null,`Commission complete!`),Q(`div`,{class:`medal ${e}`},Mh[e]),Q(`p`,null,`${n.name}, delivered in ${Ah(r)} (target ${Ah(n.par)}).`),Q(`p`,{class:`sub`},e===`gold`?`Within the target time.`:e===`silver`?`Gold needs ${Ah(n.par)} or less.`:`Silver needs ${Ah(n.par*1.5)} or less.`),Q(`p`,null,`Earned ${Math.floor(t.earned).toLocaleString()} credits · soil health ${Math.round(Yp(t))}.`),Q(`div`,{class:`actions`},Fh(`Keep playing`,()=>this.close(`done`)),Fh(`Level select`,()=>this.host.menu(),{primary:!0}))),!0)}};function zh(){return Q(`ul`,{class:`help`},Q(`li`,null,`Pick a building in the bar at the bottom, then `,Q(`b`,null,`click or drag`),` to place it. Belts follow the drag; `,Q(`b`,null,`R`),` turns them.`),Q(`li`,null,`Goods leave a building onto any belt beside it that doesn't lead back into it, and enter from any belt that points into it.`),Q(`li`,null,`Machines need power: build solar panels, turbines or a digester, and pylons within 3 tiles of everything. Batteries keep the night going.`),Q(`li`,null,`Fields grow faster with water (sprinklers) and rich soil; harvests drain the soil. Compost, beans and resting fix it.`),Q(`li`,null,`Markers: `,Q(`span`,{class:`m red`},`◆`),` no power `,Q(`span`,{class:`m orange`},`◆`),` blocked/low power `,Q(`span`,{class:`m yellow`},`◆`),` waiting for input `,Q(`span`,{class:`m blue`},`◆`),` dry `,Q(`span`,{class:`m purple`},`◆`),` not linked`),Q(`li`,null,Q(`b`,null,`Click`),` a building to inspect it · `,Q(`b`,null,`X`),` remove (refunds) · `,Q(`b`,null,`right click / Esc`),` cancel`),Q(`li`,null,Q(`b`,null,`Drag`),` (or right-drag, arrows) to pan · `,Q(`b`,null,`Q E`),` turn · `,Q(`b`,null,`wheel / Z`),` zoom · `,Q(`b`,null,`Space 1 2 3`),` pause and speed · `,Q(`b`,null,`V`),` overlays · `,Q(`b`,null,`Tab`),` stats`))}var Bh=e=>`${Math.floor(e/60)}:${String(Math.floor(e%60)).padStart(2,`0`)}`;function Vh(e){return e.goals.map(e=>e.kind===`deliver`?`${e.n} ${Df[e.item].name.toLowerCase()}`:e.kind===`rate`?`${e.perMin} ${Df[e.item].name.toLowerCase()}/min`:`soil ≥ ${e.min}`).join(` · `)}function Hh(e,t){let n=(e,n)=>{let r=t.progress[e.id];return Q(`button`,{class:`level`,onclick:()=>t.start(e.id)},Q(`div`,{class:`level-head`},n===void 0?null:Q(`span`,{class:`num`},String(n+1)),Q(`b`,null,e.name),r?Q(`span`,{class:`medal small ${r.medal}`,title:`Best: ${Bh(r.time)}`},r.medal):null),Q(`p`,null,e.blurb),e.goals.length?Q(`div`,{class:`level-goals`},Vh(e)):null,Q(`div`,{class:`tags`},...e.sandbox?[]:[Q(`span`,null,`Target ${Bh(e.par)}`)],...e.tags.map(e=>Q(`span`,null,e))))},r=Q(`input`,{type:`text`,value:String(Math.floor(Math.random()*1e5)),size:10,"aria-label":`Seed`}),i=Q(`select`,{"aria-label":`Difficulty`},Q(`option`,{value:`1`},`Easy`),Q(`option`,{value:`2`,selected:!0},`Medium`),Q(`option`,{value:`3`},`Hard`)),a=Q(`p`,{class:`preview`}),o=()=>{let e=Oh(Jf(r.value),Number(i.value));a.textContent=`${e.name}: ${Vh(e)}${e.tags.length>1?` · ${e.tags.slice(1).join(`, `)}`:``}`};r.addEventListener(`input`,o),i.addEventListener(`change`,o),o();let s=Q(`div`,{class:`menu`},Q(`header`,null,Q(`h1`,null,`Soil n Silo`),Q(`p`,null,`A solarpunk valley, one commission at a time: lay out fields, belts, drones and power, and let the farm run itself.`)),t.saved?Q(`section`,{class:`continue`},Q(`button`,{class:`primary big`,onclick:t.resume},`Continue: ${t.saved.name}`,Q(`small`,null,t.saved.done?` (complete, free play)`:` (${Bh(t.saved.time)} played)`))):null,Q(`section`,null,Q(`h2`,null,`Campaign`),Q(`div`,{class:`levels`},...Ch.map((e,t)=>n(e,t)))),Q(`section`,{class:`split`},Q(`div`,null,Q(`h2`,null,`Random commission`),Q(`div`,{class:`random`},Q(`label`,null,`Seed `,r),Q(`label`,null,`Difficulty `,i),Q(`button`,{class:`primary`,onclick:()=>t.start(Oh(Jf(r.value),Number(i.value)).id)},`Start`)),a),Q(`div`,null,Q(`h2`,null,`Sandbox`),n(wh))),t.saved?Q(`p`,{class:`note`},`Starting a commission replaces the one in progress.`):null);e.append(s)}var Uh=new Gr(1,1,1),Wh=new Map,Gh=new xa(1,1),Kh=new Map,qh=(e,t,n,r,i,a,o,s,c=Wu.NORMAL)=>e.add(Uh,$u(t,n+a/2,r,0,0,0,i,a,o),qu(s),c),Jh=(e,t)=>{let n=Math.sin(e*127.1+t*311.7)*43758.5453;return n-Math.floor(n)},Yh=class{c;animated;constructor(e=!1){this.animated=e,this.c=new td(e)}add(e,t,n,r,i,a=!0){this.c.add(e,t,qu(n),r,a,this.animated?i:void 0)}box(e,t,n,r,i,a,o,s={}){return this.add(Uh,$u(e,t+i/2,n,s.rx??0,s.ry??0,s.rz??0,r,i,a),o,s.flag??Wu.NORMAL,s.mo,!1),this}boxAt(e,t,n,r,i,a,o,s={}){return this.add(Uh,$u(e,t,n,s.rx??0,s.ry??0,s.rz??0,r,i,a),o,s.flag??Wu.NORMAL,s.mo,!1),this}cyl(e,t,n,r,i,a,o={}){let s=o.seg??8,c=s*1e3+Math.round((o.top??1)*100),l=Wh.get(c);l||(l=new va(o.top??1,1,1,s),Wh.set(c,l));let u=$u(e,t+i/2,n,o.rx??0,0,o.rz??0,r,i,r);return(o.rx||o.rz)&&u.copy($u(e,t,n,o.rx??0,0,o.rz??0).multiply($u(0,i/2,0,0,0,0,r,i,r))),this.add(l,u,a,o.flag??Wu.NORMAL,o.mo),this}cone(e,t,n,r,i,a,o={}){let s=o.seg??8,c=Kh.get(s);return c||(c=new ya(1,1,s),Kh.set(s,c)),this.add(c,$u(e,t+i/2,n,0,0,0,r,i,r),a,o.flag??Wu.NORMAL),this}ball(e,t,n,r,i,a={}){return this.add(Gh,$u(e,t,n,0,0,0,r,r*(a.sy??1),r),i,a.flag??Wu.NORMAL,a.mo),this}smoke(e,t,n,r,i=4,a=15526128){if(!this.animated)return this;let o=new xa(.16,1);for(let s=0;s<i;s++)this.c.add(o,null,qu(a),Wu.STEAM,!1,cf.smoke([e,t,n],s/i,r+s*.17));return this}build(){return this.c.build()}},$={timber:10517072,dark:6966324,plank:12096094,ceramic:15656662,cream:14734520,copper:13138506,brass:14198858,solar:2903168,solarLight:4879536,glass:10146008,moss:6986312,leaf:5212730,leafLight:8040528,terracotta:13135946,slate:4940912,stone:9079940,stoneLight:11578008,soil:6965808,glow:16766603,fire:16751673,red:13126202,white:16184042,belt:4867136,beltLight:6971994};function Xh(e,t,n,r,i,a){e.box(t,n,r,i,.08,a,$.dark).box(t,n+.08,r,i-.08,.08,a-.08,$.moss)}function Zh(e,t,n,r=0){e.box(t,r,n,.3,.18,.3,$.terracotta).ball(t,r+.28,n,.18,$.leafLight)}var Qh={field:e=>{for(let t of[-1,0,1])for(let n of[-1,0,1])e.box(t,-.05,n,.98,.08,.98,9071174).box(t,.03,n,.3,.12,.3,$.leafLight)},belt:e=>{e.box(-.44,0,0,.08,.18,1,$.timber).box(.44,0,0,.08,.18,1,$.timber).box(0,.06,0,.82,.08,.98,$.belt);for(let t of[-.25,.25])e.box(-.12,.14,t,.26,.02,.07,$.beltLight,{ry:-.6}).box(.12,.14,t,.26,.02,.07,$.beltLight,{ry:.6})},splitter:e=>{e.box(0,0,0,.96,.16,.96,$.timber).cyl(0,.16,0,.36,.06,$.belt,{seg:10}).box(0,.22,0,.6,.06,.08,$.brass).box(0,.22,0,.08,.06,.6,$.brass).cyl(0,.22,0,.1,.12,$.copper)},sorter:e=>{e.box(-.44,0,0,.08,.18,1,$.timber).box(.44,0,0,.08,.18,1,$.timber).box(0,.06,0,.82,.08,.98,$.belt).box(-.4,.18,-.2,.06,.4,.06,$.copper).box(.4,.18,-.2,.06,.4,.06,$.copper).box(0,.54,-.2,.86,.08,.08,$.copper).box(.12,.14,.25,.26,.02,.07,$.brass,{ry:.6}).box(-.12,.14,.25,.26,.02,.07,$.brass,{ry:-.6})},crossing:e=>{e.box(0,0,0,.82,.12,.98,$.belt).box(-.44,0,0,.08,.16,1,$.timber).box(.44,0,0,.08,.16,1,$.timber).box(0,.3,0,.98,.07,.7,$.beltLight).box(0,.16,-.36,1,.14,.06,$.plank).box(0,.16,.36,1,.14,.06,$.plank)},pad:e=>{e.box(0,0,0,1.9,.12,1.9,$.stoneLight).cyl(0,.12,0,.8,.04,$.slate,{seg:16}).cyl(0,.16,0,.62,.02,$.cream,{seg:16}).cyl(0,.17,0,.5,.02,$.slate,{seg:16});for(let[t,n]of[[-.82,-.82],[.82,-.82],[-.82,.82],[.82,.82]])e.box(t,.12,n,.12,.08,.12,$.glow,{flag:Wu.EMISSIVE});e.box(-.8,.12,0,.08,.7,.08,$.copper).box(-.8,.82,0,.18,.12,.18,$.solar),Zh(e,.75,0,.12)},sprinkler:e=>{e.box(0,0,0,.36,.08,.36,$.stone).cyl(0,.08,0,.05,.55,$.copper,{seg:6}).box(0,.63,0,.6,.05,.06,$.brass,{mo:cf.spin([0,.65,0],[0,1,0],3)}).cyl(0,.6,0,.08,.1,$.copper,{seg:6})},hive:e=>{for(let[t,n]of[[-.22,-.18],[.22,-.18],[-.22,.18],[.22,.18]])e.box(t,0,n,.06,.3,.06,$.dark);e.box(0,.3,0,.56,.2,.46,$.white).box(0,.5,0,.56,.2,.46,$.brass).box(0,.7,0,.6,.06,.5,$.terracotta).box(0,.33,.23,.18,.04,.02,$.dark);for(let[t,n,r]of[[.4,.35,15224954],[-.38,.38,15781968],[.38,-.38,10514656]])e.box(t,0,n,.08,.25,.08,$.leaf).ball(t,.3,n,.08,r)},composter:e=>{for(let t of[-.5,.5]){for(let n=0;n<4;n++)e.box(t,n*.2,-.65,.86,.14,.08,$.plank).box(t,n*.2,.65,.86,.14,.08,$.plank);e.box(t-.43,0,0,.08,.8,1.38,$.timber).box(t+.43,0,0,.08,.8,1.38,$.timber).box(t,0,0,.8,.62,1.2,$.soil)}e.ball(-.5,.62,0,.3,5913124,{sy:.5}).ball(.5,.62,.1,.25,$.leafLight,{sy:.5})},mill:e=>{e.box(0,0,0,1.7,.2,1.7,$.stoneLight).box(0,.2,0,1.3,1,1.3,$.ceramic).box(0,.2,.66,.4,.6,.02,$.dark),Xh(e,0,1.2,0,1.5,1.5),e.cone(.2,1.36,-.2,.42,.55,$.copper,{seg:8}).box(.2,1.9,-.2,.5,.12,.5,$.brass),e.cyl(-.7,.55,.2,.38,.1,$.timber,{seg:10,rz:Math.PI/2,mo:cf.spin([-.75,.55,.2],[1,0,0],2.4)}),e.box(.4,.6,.66,.3,.26,.04,$.glow,{flag:Wu.EMISSIVE}),Zh(e,.7,.75,.2)},press:e=>{e.box(0,0,0,1.7,.18,1.7,$.stoneLight).box(-.3,.18,0,.9,.7,1.1,$.timber).box(-.3,.88,0,1,.1,1.2,$.dark).cyl(-.3,.98,0,.08,.4,$.copper,{seg:6}).cyl(-.3,1.38,0,.42,.06,$.brass,{seg:8,mo:cf.spin([-.3,1.4,0],[0,1,0],1.5)}).cyl(.5,.18,.35,.22,.45,15253568,{seg:8}).cyl(.5,.63,.35,.12,.1,$.dark,{seg:6}).box(.5,.18,-.4,.4,.3,.4,$.plank),Zh(e,.65,-.05,.18)},spinner:e=>{e.box(0,0,0,1.7,.16,1.7,$.stoneLight).box(-.55,.16,0,.12,.9,.12,$.timber).box(.55,.16,0,.12,.9,.12,$.timber).box(0,.16,-.4,1.4,.12,.5,$.plank).cyl(0,.9,0,.5,.08,$.timber,{seg:12,rz:Math.PI/2,mo:cf.spin([0,.9,0],[1,0,0],3)}).box(0,.86,0,1.2,.08,.08,$.dark);for(let t of[-.4,-.15,.1,.35])e.cyl(t,.28,-.4,.07,.3,14209256,{seg:6});Zh(e,.6,.6,.16)},loom:e=>{e.box(0,0,0,1.7,.16,1.7,$.stoneLight);for(let t of[-.7,.7])e.box(t,.16,-.5,.1,1.3,.1,$.timber).box(t,.16,.5,.1,1.3,.1,$.timber).box(t,1.4,0,.1,.1,1.1,$.timber);e.box(0,1.4,-.5,1.5,.1,.1,$.dark).box(0,.6,0,1.3,.06,.9,15525072).box(0,.5,.5,1.4,.1,.12,$.dark).box(0,.9,0,1.3,.12,.08,$.copper,{mo:cf.swing([0,1.4,0],[1,0,0],.35)}),Zh(e,.65,.7,.16)},bakery:e=>{e.box(0,0,0,1.7,.18,1.7,$.stoneLight).box(0,.18,0,1.4,.9,1.3,$.terracotta).ball(0,1.08,0,.66,$.terracotta,{sy:.6}).box(0,.3,.62,.55,.45,.1,$.dark).box(0,.32,.66,.42,.32,.04,$.fire,{flag:Wu.EMISSIVE}).box(.45,1,-.35,.26,.9,.26,$.stone).box(.45,1.9,-.35,.32,.08,.32,$.dark),Xh(e,-.3,1.45,0,.6,.6),e.smoke(.45,2,-.35,.7)},cannery:e=>{e.box(0,0,0,1.7,.18,1.7,$.stoneLight).cyl(-.3,.18,-.15,.55,.75,$.copper,{seg:10}).ball(-.3,.93,-.15,.55,$.copper,{sy:.45}).cyl(-.3,1.1,-.15,.06,.4,$.brass,{seg:6}).box(.55,.18,.2,.5,.7,.9,$.timber);for(let t of[-.1,.15,.4])for(let n of[.3,.6])e.cyl(.55,n+.1,t,.08,.16,$.red,{seg:6});e.smoke(-.3,1.5,-.15,.4,3)},solar:e=>{e.box(0,0,0,1.9,.06,1.9,$.moss);for(let t of[-.8,.8])e.box(t,0,-.5,.1,.5,.1,$.timber).box(t,0,.5,.1,.9,.1,$.timber);e.boxAt(0,.75,0,1.86,.06,1.5,$.dark,{rx:-.42}).boxAt(0,.79,0,1.76,.04,1.4,$.solar,{rx:-.42}).boxAt(0,.81,0,.04,.02,1.4,$.solarLight,{rx:-.42}).boxAt(0,.81,0,1.76,.02,.04,$.solarLight,{rx:-.42})},turbine:e=>{e.box(0,0,0,.6,.12,.6,$.stone).cyl(0,.12,0,.12,3,$.white,{seg:8,top:.6}).box(0,3.05,-.05,.22,.22,.5,$.white).cone(0,3.05,.25,.09,.15,$.copper);let t=[0,3.16,.24];for(let n=0;n<3;n++){let r=n*Math.PI*2/3;e.boxAt(Math.sin(r)*.55,3.16+Math.cos(r)*.55,.24,.1,1.1,.03,$.white,{rz:-r,mo:cf.spin(t,[0,0,1],2.2)})}},battery:e=>{e.box(0,0,0,1.8,.12,1.8,$.stoneLight).box(0,.12,0,1.5,.9,1.1,$.ceramic).box(0,1.02,0,1.6,.1,1.2,$.copper).box(-.4,.3,.56,.4,.5,.02,$.glass,{flag:Wu.EMISSIVE}).box(.4,.3,.56,.4,.5,.02,$.glass,{flag:Wu.EMISSIVE});for(let t of[-.7,.7])e.box(t,.12,0,.06,.9,1.14,$.copper);Xh(e,0,1.12,0,1,.8)},digester:e=>{e.box(0,0,0,1.8,.14,1.8,$.stoneLight).cyl(0,.14,0,.78,.5,$.cream,{seg:12}).ball(0,.64,0,.78,$.moss,{sy:.7}).cyl(.6,.5,.55,.05,.9,$.copper,{seg:6}).cyl(.6,1.4,.55,.09,.08,$.brass,{seg:6}).box(-.4,.14,.72,.36,.36,.1,$.dark),e.smoke(.6,1.5,.55,.2,3,14212304)},pylon:e=>{e.box(0,0,0,.3,.1,.3,$.stone).cyl(0,.1,0,.07,1.9,$.timber,{seg:6}).box(0,1.75,0,.6,.06,.08,$.dark).cyl(-.26,1.81,0,.05,.1,$.copper,{seg:6}).cyl(.26,1.81,0,.05,.1,$.copper,{seg:6}).box(0,2,0,.18,.08,.18,$.solar).box(0,1.92,0,.1,.08,.1,$.glow,{flag:Wu.EMISSIVE})},sapling:e=>{e.box(0,0,0,.3,.04,.3,$.soil).cyl(0,0,0,.03,.55,$.dark,{seg:5}).ball(0,.6,0,.18,$.leafLight).ball(.08,.45,.05,.12,$.leaf)},depot:e=>{e.box(0,0,0,2.9,.3,2.9,$.stoneLight).box(0,.3,-.7,2.6,.9,1.2,$.timber).box(0,.3,-.7,2.4,.7,1.24,$.plank),Xh(e,0,1.2,-.7,2.8,1.5);for(let t of[-1.2,1.2])e.box(t,.3,.8,.12,1.8,.12,$.timber);e.box(0,2.1,.8,2.6,.12,.3,$.dark).box(0,2.22,.8,1.2,.24,.06,$.cream);for(let[t,n]of[[-.8,.4],[-.4,.5],[.7,.3]])e.box(t,.3,n,.36,.3,.36,$.plank);e.box(1,.3,.9,.3,.3,.3,$.plank).cyl(-.4,.6,.5,.12,.2,$.red,{seg:6}),e.box(.3,.42,-.08,.5,.36,.04,$.glow,{flag:Wu.EMISSIVE})}};function $h(e){let t=Qh[e]??(e=>e.box(0,0,0,.8,.8,.8,$.red)),n=new Yh(!1),r=new Yh(!0);return t(n),t(r),{idle:n.build(),running:r.build()}}var eg={wheat:(e,t,n)=>{for(let r=0;r<5;r++){let i=-.3+r%3*.3,a=-.25+Math.floor(r/3)*.4,o=.15+.17*t;e.box(i,0,a,.06,o,.06,t===n-1?13148224:$.leafLight,{mo:cf.sway(i,a,0,.6)}),t>=2&&e.box(i,o,a,.1,.16,.1,t===n-1?14860890:12107872,{mo:cf.sway(i,a,0,.6)})}},beans:(e,t,n)=>{e.box(0,0,0,.05,.25+.2*t,.05,$.dark);for(let n=0;n<=t;n++)e.ball(.05*(n%2?1:-1),.15+.18*n,0,.14,$.leaf,{mo:cf.sway(0,0,0,.8)});if(t===n-1)for(let[t,n]of[[.12,.3],[-.1,.5],[.1,.6]])e.box(t,n,.08,.05,.16,.05,6986298)},tomato:(e,t,n)=>{if(e.ball(0,.12+.1*t,0,.18+.06*t,$.leaf,{sy:1.2,mo:cf.sway(0,0,0,.6)}),t>=2)for(let[r,i,a]of[[.15,.25,.12],[-.14,.32,.1],[.05,.4,-.15]])e.ball(r,i+.05*t,a,.07,t===n-1?14700602:10141776)},sunflower:(e,t,n)=>{let r=.25+.3*t;e.box(0,0,0,.06,r,.06,$.leaf,{mo:cf.sway(0,0,0,r)}).ball(.08,r*.5,0,.1,$.leafLight,{sy:.4}),t>=2&&e.boxAt(0,r+.05,.05,.36,.36,.06,t===n-1?15910458:11059280,{rx:.5,mo:cf.sway(0,0,0,r)}).boxAt(0,r+.05,.09,.16,.16,.04,6965802,{rx:.5,mo:cf.sway(0,0,0,r)})},flax:(e,t,n)=>{for(let r=0;r<6;r++){let i=-.3+r%3*.3,a=-.2+Math.floor(r/3)*.4,o=.12+.14*t;e.box(i,0,a,.04,o,.04,8036432,{mo:cf.sway(i,a,0,.5)}),t===n-1&&e.ball(i,o+.03,a,.06,9087208,{mo:cf.sway(i,a,0,.5)})}}};function tg(e,t,n){let r=new Yh(!0);return eg[e](r,t,n),r.build()}function ng(e){let t=new Yh(!1),n=Df[e].colour;switch(e){case`egg`:t.ball(0,.1,0,.09,n,{sy:1.25});break;case`tomato`:case`honey`:t.ball(0,.1,0,.1,n);break;case`oil`:case`sauce`:t.cyl(0,0,0,.09,.2,n,{seg:6}).cyl(0,.2,0,.05,.05,$.dark,{seg:6});break;case`bread`:t.ball(0,.08,0,.14,n,{sy:.6});break;case`honeycake`:t.cyl(0,0,0,.13,.12,n,{seg:8}).cyl(0,.12,0,.13,.03,16312520,{seg:8});break;case`linen`:case`yarn`:t.cyl(0,0,0,.1,.16,n,{seg:8});break;case`wheat`:case`flax`:t.box(0,0,0,.12,.22,.12,n);break;case`manure`:case`compost`:t.ball(0,.06,0,.12,n,{sy:.5});break;default:t.box(0,0,0,.18,.16,.18,n)}return t.build()}function rg(e){let t=new Yh(!1);return t.boxAt(0,0,0,.22,.22,.22,e,{flag:Wu.EMISSIVE,rx:Math.PI/4,rz:Math.PI/4}),t.build()}function ig(e,t,n=.06){let r=new Yh(!1),i=e/2-n/2;for(let[a,o,s,c]of[[0,-i,e,n],[0,i,e,n],[-i,0,n,e-2*n],[i,0,n,e-2*n]])r.box(a,0,o,s,.02,c,t,{flag:Wu.EMISSIVE});return r.build()}function ag(e){let t=new Yh(!1);return t.box(0,0,0,.84,.015,.84,e,{flag:Wu.DECOR}),t.build()}function og(){let e=new Yh(!0);e.box(0,0,0,.32,.1,.32,$.white).box(0,-.1,0,.26,.1,.26,$.plank);for(let[t,n]of[[-.25,-.25],[.25,-.25],[-.25,.25],[.25,.25]])e.box(t/2,.04,n/2,Math.abs(t)+.04,.03,.04,$.dark,{ry:Math.atan2(t,n)}),e.box(t,.08,n,.3,.015,.05,$.cream,{mo:cf.spin([t,.09,n],[0,1,0],18)});return e.box(0,.1,.12,.08,.03,.06,$.glow,{flag:Wu.EMISSIVE}),e.build()}function sg(e){let t=new Yh(!1),n=[[[0,.18,0,.36],[.22,.1,.18,.2]],[[0,.22,.05,.42],[-.24,.12,-.2,.22],[.25,.08,-.15,.16]],[[.05,.14,0,.3],[-.2,.1,.2,.18]]][e%3];for(let[r,i,a,o]of n)t.ball(r,i,a,o,e%2?$.stone:$.stoneLight,{sy:.75});return t.ball(.15,.03,.3,.12,$.moss,{sy:.3}),t.build()}var cg=[12098154,10518616,9071174,7558712,6177836,4863010],lg=e=>Math.min(5,Math.floor(e/(100/6)));function ug(e){let t=new Yh(!1);t.box(0,-.05,0,.98,.08,.98,cg[e]);for(let n of[-.3,0,.3])t.box(0,.03,n,.9,.015,.08,cg[Math.max(0,e-1)]);return t.build()}var dg={belt:[`belt`],splitter:[`splitter`],sorter:[`sorter`],crossing:[`crossing`],pad:[`drone_pad`],sprinkler:[`sprinkler`],coop:[`coop_solar`,`coop`],hive:[`beehive`],composter:[`composter`],mill:[`mill_electric`],press:[`oil_press`],spinner:[`spinner`],loom:[`loom`],bakery:[`bakery`],cannery:[`cannery`],solar:[`solar_panel`],turbine:[`wind_turbine`],battery:[`battery`],digester:[`digester`],pylon:[`pylon`],sapling:[`sapling`],depot:[`depot`]},fg=e=>`./models/${e}.glb`;async function pg(e){try{return await pf(fg(e))}catch{return null}}function mg(e,t=()=>!0,n,r=!!n){let i=new td(r);e.updateMatrixWorld(!0);let a=e.matrixWorld.clone().invert(),o=new ui;return e.traverse(n=>{let r=n;if(!r.isMesh||!hg(r,e,t))return;let i=new Hr(r.geometry,r.material);i.name=r.name,i.userData={source:r},i.matrixAutoUpdate=!1,i.matrix.multiplyMatrices(a,r.matrixWorld),o.add(i)}),o.updateMatrixWorld(!0),mf(o,i,i,e=>{let t=df(e.userData.source)??{},r=n?.(e.userData.source);return r?{...t,motion:r}:t}),i}function hg(e,t,n){for(let r=e;r&&r!==t;r=r.parent)if(!n(r))return!1;return!0}var gg=e=>t=>t.name.toLowerCase().startsWith(e),_g=e=>t=>!e(t);function vg(e,t,n){let r=t.getObjectByName(`smoke_emitter`);if(!r)return;t.updateMatrixWorld(!0);let i=r.getWorldPosition(new W).applyMatrix4(t.matrixWorld.clone().invert()),a=new xa(.16,1);for(let t=0;t<4;t++)e.add(a,null,[.82,.8,.86],3,!1,cf.smoke(i.toArray(),t/4,n+t*.17))}function yg(e,t){let n=mg(e,_g(gg(`running_`))).build(),r=mg(e,_g(gg(`idle_`)),ff,!0);return vg(r,e,t),{idle:n,running:r.build()}}var bg=e=>(e.computeBoundingBox(),e.boundingBox?e.boundingBox.max.y:1);async function xg(){let e=new Set([`wheat`,`tomato`,`beans`,`sunflower`,`flax`,`rock`,`drone`,`tree_oak`,`tree_pine`,`bush`]);for(let t of Object.values(dg))for(let n of t)e.add(n);let t=new Map(await Promise.all([...e].map(async e=>[e,await pg(e)]))),n=[...t].filter(([,e])=>!e).map(([e])=>e);n.length&&console.info(`models drawn from stand-ins: ${n.join(`, `)}`);let r={};Nf.forEach((e,n)=>{let i=dg[e]?.map(e=>t.get(e)).find(e=>e)??null,a=i?yg(i,n*.13):$h(e);r[e]={...a,height:bg(a.idle)}});let i=t.get(`wind_turbine`),a=[.6,1.6,3].map(e=>i?mg(i,()=>!0,t=>{let n=ff(t);return n&&n.anim?{...n,anim:[...n.anim.slice(0,3),e]}:n},!0).build():$h(`turbine`).running),o={};for(let e of Af){let n=jf[e].stages,r=t.get(e),i=[];if(r)for(let e=0;;e++){let t=r.getObjectByName(`stage_${e}`);if(!t)break;i.push(t)}o[e]=Array.from({length:n},(t,r)=>{if(i.length<2)return tg(e,r,n);let a=i[Math.round(r*(i.length-1)/(n-1))],o=new Ht().setFromObject(a).max.y;return mg(a,void 0,()=>cf.sway(0,0,0,Math.max(.3,o))).build()})}let s=t.get(`rock`),c=[0,1,2].map(e=>{let t=s?.getObjectByName(`variant_${e}`);return t?mg(t).build():sg(e)}),l=[`tree_oak`,`tree_pine`,`bush`].map(e=>{let n=t.get(e);return n?mg(n).build():$h(`sapling`).idle}),u=t.get(`drone`),d={};for(let e of Ef)d[e]=ng(e);return{buildings:r,turbine:a,crops:o,items:d,rocks:c,trees:l,soil:Array.from({length:6},(e,t)=>ug(t)),drone:u?mg(u,()=>!0,ff,!0).build():og(),markers:{red:rg(16730682),orange:rg(16752688),yellow:rg(16769120),blue:rg(6338815),purple:rg(12611839)},cursor:ig(1,16773312),frames:{ok:[1,2,3].map(e=>ig(e,14221232)),bad:[1,2,3].map(e=>ig(e,16732224))},fill:ag(16052448)}}function Sg(e){return[...Object.values(e.buildings).flatMap(e=>[e.idle,e.running]),...e.turbine,...Object.values(e.crops).flat(),...Object.values(e.items),...e.soil,...e.trees,...e.rocks,e.drone,...Object.values(e.markers),e.cursor,...e.frames.ok,...e.frames.bad,e.fill]}var Cg=[[11053152,11578982],[9610326,10005082],[8166988,8561744],[7116870,7512138],[6197314,6592070]];function wg(e,t){let n=new td,r=new td(!0),i=new ad,{width:a,height:o}=e,s=(t,n)=>t<0||n<0||t>=a||n>=o?ep.grass:e.terrain[n*a+t],c=(t,n)=>t>=0&&n>=0&&t<a&&n<o&&e.terrain[n*a+t]===ep.water;for(let t=0;t<o;t++)for(let r=0;r<a;r++){let o=r+.5,l=t+.5,u=Jh(r,t);if(s(r,t)===ep.water){qh(n,o,-.6,l,1,.2,1,9075290);for(let[e,i]of[[1,0],[-1,0],[0,1],[0,-1]])c(r+e,t+i)||qh(n,o+e*.5,-.6,l+i*.5,i?1:.02,.6,e?1:.02,6969918);i.add(new Sa(1,1),$u(o,-.12,l,-Math.PI/2),nd.water);continue}let d=e.fertility[t*a+r];qh(n,o,-.5,l,1,.5,1,Cg[Math.min(4,Math.floor(d/20))][u<.5?0:1])}for(let[e,t,r,i]of[[a/2,-30,a+120,60],[a/2,o+30,a+120,60],[-30,o/2,60,o],[a+30,o/2,60,o]])qh(n,e,-.5,t,r,.48,i,6261312);let l=(e,r,i)=>{let a=Jh(e*3.1,r*1.7),o=t[i%t.length].clone();o.applyMatrix4($u(e,-.02,r,0,a*Math.PI*2,0,.85+.35*a)),n.pushPrepared(o)},u=0;for(let e=-4;e<a+4;e+=1.6)for(let t of[-1.4,-3.2,o+1.4,o+3.2])l(e+Jh(e,t)*.8,t+Jh(t,e)*.6,u++);for(let e=0;e<o;e+=1.6)for(let t of[-1.4,-3.2,a+1.4,a+3.2])l(t+Jh(t,e)*.6,e+Jh(e,t)*.8,u++);let d=new Gr(1,1,1);for(let e=0;e<160;e++){let t=e%4,n=Jh(e,7),i=t<2?-6+n*(a+12):t===2?-.6-Jh(e,9)*.5:a+.6+Jh(e,9)*.5,s=t>=2?n*o:t===0?-.6-Jh(e,9)*.5:o+.6+Jh(e,9)*.5;r.add(d,$u(i,.12,s,0,0,0,.04,.26,.04),qu(4880938),Wu.NORMAL,!1,cf.sway(i,s,0,.3)),r.add(d,$u(i,.28,s,0,0,0,.11,.08,.11),qu([14703226,15781968,10514656,16184042][e%4]),Wu.NORMAL,!1,cf.sway(i,s,0,.3))}let f=n.build(),p=r.build();return{scene:{staticGeometry:f,dynamicGeometry:p,fluids:i.build(),shadow:{center:new W(a/2,0,o/2),radius:Math.max(a,o)*.62}},geometries:[f,p]}}var Tg=.16,Eg={0:Math.PI,1:Math.PI/2,2:0,3:-Math.PI/2},Dg=new W,Og=new Tn,kg=[11546656,13660192,14200864,10010672,5283888,2128432].map(e=>new J(e)),Ag=new J(15781984),jg=new J(6334696),Mg=new J(15765552),Ng=class{targets=new Map;shown=new Map;parts=new Map;markers=new Map;drones=new Map;pools=new Map;terrain=[];terrainTiles=new Map;terrainKey=``;overlayObjs=[];overlayKey=``;r;m;constructor(e,t){this.r=e,this.m=t}buildingOf(e){return e?this.targets.get(e)??null:null}terrainOf(e){return e?this.terrainTiles.get(e)??null:null}objectsOf(e){let t=[],n=this.shown.get(e);n&&t.push(n.obj);for(let n of this.parts.get(e)??[])t.push(n.obj);return t}add(e,t){let n=this.r.addObject(e);return t!==null&&this.targets.set(n,t),n}drop(e){this.targets.delete(e),e.remove()}show(e,t,n,r,i){if(e&&e.key===t)return e;e&&this.drop(e.obj);let a=this.add(n(),r);return i(a),{obj:a,key:t}}sync(e){this.syncTerrain(e);let t=new Set,n=Ip(e.scenario,e.time);for(let r of e.buildings){t.add(r.id);let i=up(r),a=r.x+i/2,o=r.y+i/2;if(r.type===`field`){this.syncField(e,r);continue}let s=Pg(r),c=`${r.type} ${r.x} ${r.y} ${r.rot} ${s}`,l=()=>this.m.buildings[r.type][s?`running`:`idle`];if(r.type===`turbine`){let e=n<.35?0:n<.7?1:2;c+=` ${e}`,l=()=>this.m.turbine[e]}this.shown.set(r.id,this.show(this.shown.get(r.id),c,l,r.id,e=>e.setTransform(Dg.set(a,0,o),Og.set(0,Eg[r.rot],0)))),r.type===`sorter`&&this.syncFilter(r,a,o)}for(let[e,n]of this.shown)t.has(e)||(this.drop(n.obj),this.shown.delete(e));for(let[e,n]of this.parts)if(!t.has(e)){for(let e of n)this.drop(e.obj);this.parts.delete(e)}this.syncMarkers(e,t),this.syncGoods(e),this.syncDrones(e,t)}syncField(e,t){let n=this.parts.get(t.id)??[],r=jf[t.crop],i=t.stored>=r.yield?r.stages-1:Math.min(r.stages-1,Math.floor(t.growth*r.stages)),a=0;for(let r=t.y;r<t.y+3;r++)for(let o=t.x;o<t.x+3;o++){let s=lg(e.map.fertility[r*e.map.width+o]);n[a]=this.show(n[a],`soil ${o} ${r} ${s}`,()=>this.m.soil[s],t.id,e=>e.setTransform(Dg.set(o+.5,0,r+.5))),a++;let c=Math.floor(Jh(o,r)*4)*Math.PI/2;n[a]=this.show(n[a],`crop ${o} ${r} ${t.crop} ${i}`,()=>this.m.crops[t.crop][i],t.id,e=>e.setTransform(Dg.set(o+.5,.03,r+.5),Og.set(0,c,0))),a++}this.parts.set(t.id,n)}syncFilter(e,t,n){let r=this.parts.get(e.id)??[];e.filter?r[0]=this.show(r[0],`filter ${e.filter}`,()=>this.m.items[e.filter],e.id,e=>e.setTransform(Dg.set(t,.62,n),Og.set(0,0,0),1.4)):r[0]&&(this.drop(r[0].obj),r.length=0),this.parts.set(e.id,r)}syncMarkers(e,t){for(let t of e.buildings){let e=Ig(t),n=this.markers.get(t.id);if(!e){n&&(this.drop(n.obj),this.markers.delete(t.id));continue}let r=up(t),i=this.m.buildings[t.type].height;this.markers.set(t.id,this.show(n,e,()=>this.m.markers[e],t.id,e=>(e.castShadow=!1,e).setTransform(Dg.set(t.x+r/2,(t.type===`field`?.9:i)+.45,t.y+r/2))))}for(let[e,n]of this.markers)t.has(e)||(this.drop(n.obj),this.markers.delete(e))}syncGoods(e){for(let e of this.pools.values())e.used=0;let t=(e,t,n,r,i)=>{let a=this.pools.get(e);a||(a={objs:[],used:0},this.pools.set(e,a));let o=a.objs[a.used];o||(o=this.add(this.m.items[e],null),o.castShadow=!1,a.objs.push(o)),a.used++,o.visible=!0,o.setTransform(Dg.set(t,n,r),Og.set(0,i,0))};for(let n of e.buildings)if(n.type===`belt`)for(let e of n.items)t(e.item,n.x+.5+rp[n.rot]*(e.pos-.5),Tg,n.y+.5+ip[n.rot]*(e.pos-.5),Eg[n.rot]);else if(n.transit)for(let e of n.transit){let r=Math.max(0,e.t)/Hf*.4;t(e.item,n.x+.5+rp[e.from]*r,.18,n.y+.5+ip[e.from]*r,0)}for(let e of this.pools.values())for(let t=e.used;t<e.objs.length;t++)e.objs[t].visible=!1}syncDrones(e,t){for(let t of e.buildings){if(t.type!==`pad`||t.mode!==`send`)continue;let n=this.drones.get(t.id);n||(n=this.add(this.m.drone,t.id),this.drones.set(t.id,n));let r=t.drone,i=wp(t),a=r.target?Sp(e,r.target):Em(e,t),o=a?wp(a):i,s=0;r.phase===`out`?s=r.t:r.phase===`hover`?s=1:r.phase===`back`&&(s=1-r.t);let c=i.x+(o.x-i.x)*s,l=i.y+(o.y-i.y)*s,u=r.phase===`home`?.35:.35+Math.min(1,Math.sin(Math.PI*s)*3)*2.2+(r.phase===`hover`?.8:0);n.setTransform(Dg.set(c,u,l),Og.set(0,Math.atan2(o.x-i.x,o.y-i.y),0))}for(let[n,r]of this.drones){let i=t.has(n)?e.buildings.find(e=>e.id===n):null;(!i||i.mode!==`send`)&&(this.drop(r),this.drones.delete(n))}}syncTerrain(e){let t=String(hp(e));if(t===this.terrainKey)return;this.terrainKey=t;let{width:n}=e.map;e.map.terrain.forEach((e,t)=>{let r=t%n,i=Math.floor(t/n),a=Jh(r,i),o=e===ep.tree?`tree${Math.floor(a*3)}`:e===ep.rock?`rock${Math.floor(a*3)}`:null,s=this.terrain[t];if(s&&s.key===o||(s&&(this.terrainTiles.delete(s.obj),this.drop(s.obj),this.terrain[t]=null),!o))return;let c=e===ep.tree?this.m.trees[a<.55?0:a<.85?1:2]:this.m.rocks[Math.floor(a*3)%3],l=this.add(c,null);l.setTransform(Dg.set(r+.5,0,i+.5),Og.set(0,a*Math.PI*2,0),e===ep.tree?.62+.25*a:1),this.terrainTiles.set(l,{x:r,y:i}),this.terrain[t]={obj:l,key:o}})}tile(e){let t=this.r.addObject(this.m.fill);return t.tint=e,t.tintStrength=1,t.castShadow=!1,t}overlay(e,t){let n=t===`none`?`none`:`${t} ${t===`fertility`?e.map.fertility.map(e=>Math.floor(e/17)).join(``):``} ${e.buildings.length} ${jp(e).layout}`;if(n===this.overlayKey)return;this.overlayKey=n;for(let e of this.overlayObjs)e.remove();if(this.overlayObjs=[],t===`none`)return;let{width:r,height:i}=e.map,a=new Set,o=(e,t,n,o)=>{for(let s=t-o;s<t+n+o;s++)for(let t=e-o;t<e+n+o;t++)t>=0&&s>=0&&t<r&&s<i&&a.add(s*r+t)};if(t===`fertility`){for(let t=0;t<r*i;t++){if(e.map.terrain[t]!==ep.grass)continue;let n=this.tile(kg[Math.min(5,Math.floor(e.map.fertility[t]/17))]);n.setTransform(Dg.set(t%r+.5,.02,Math.floor(t/r)+.5)),this.overlayObjs.push(n)}return}for(let n of e.buildings)t===`power`&&n.type===`pylon`&&o(n.x,n.y,1,zf.pylon.reach),t===`water`&&n.type===`sprinkler`&&o(n.x-1,n.y-1,3,zf.sprinklerReach-1),t===`bees`&&n.type===`hive`&&o(n.x,n.y,1,Bf.reach);let s=t===`power`?Ag:t===`water`?jg:Mg;for(let e of a){let t=this.tile(s);t.setTransform(Dg.set(e%r+.5,.02,Math.floor(e/r)+.5)),this.overlayObjs.push(t)}}};function Pg(e){return e.type===`pad`?e.drone?.phase!==`home`||e.mode===`receive`&&e.store.length>0:e.recipe?e.progress!==null&&e.progress!==void 0:e.status===`ok`}var Fg=new Set([`belt`,`splitter`,`sorter`,`crossing`,`depot`,`sapling`]);function Ig(e){if(Fg.has(e.type))return null;switch(e.status){case`power`:case`nolink`:return e.type===`pad`&&e.status===`nolink`?`purple`:`red`;case`lowpower`:return`orange`;case`blocked`:return`orange`;case`input`:return e.type===`pad`?null:`yellow`;case`flowers`:return`yellow`;case`dry`:return`blue`;default:return null}}var Lg=16,Rg=[1,2,3,4,6],zg=pt.degToRad(30),Bg=pt.degToRad(45),Vg=4,Hg=100,Ug=200,Wg=.3,Gg=6,Kg=30,qg=80,Jg=document.querySelector(`#view`),Yg=document.querySelector(`#loading`),Xg=th(location.pathname),Zg=`${Xg}:progress`,Qg=rh(localStorage.getItem(Xg)),$g=new URLSearchParams(location.search),e_=$g.get(`play`),t_=!1;function n_(e){let t=kh(e);t&&(t_=!0,localStorage.setItem(Xg,nh(cp(t))),location.href=location.pathname)}e_?n_(e_):!Qg||$g.has(`menu`)?(Yg.remove(),Hh(document.body,{saved:Qg?{name:Qg.scenario.name,time:Qg.time,done:Qg.completedAt!==null}:null,progress:_h(localStorage.getItem(Zg)),resume:()=>{location.href=location.pathname},start:n_})):await r_(Qg);async function r_(e){let t=e,n=t.map,r=await xg(),i=wg(n,r.trees);_f([...i.geometries,...Sg(r)],96);let a=new of(Jg,i.scene,{shadowMapSize:2048,warmHighlight:!0}),o=new Ng(a,r),s=a.addObject(r.cursor);s.visible=!1,Yg.remove();let c=1,l=!1,u=`none`,d={kind:`select`},f=null,p=()=>{t_||localStorage.setItem(Xg,nh(t))};addEventListener(`pagehide`,p),document.addEventListener(`visibilitychange`,()=>{document.hidden&&p()});let m=new Rh(document.body,{state:()=>t,tool:()=>d,setTool:e=>h(e),speed:()=>l?0:c,setSpeed:e=>{e===0?l=!l:(c=e,l=!1)},overlay:()=>u,setOverlay:e=>{u=u===e?`none`:e},selected:()=>f,select:e=>{f=e},changed:()=>{S=2},turn:e=>D(e),zoom:()=>k((v+1)%Rg.length),menu:()=>{p(),location.href=`${location.pathname}?menu`},restart:()=>n_(t.scenario.id)});t.time===0&&m.showIntro();function h(e){d=e,e.kind!==`select`&&(f=null),le(),S=2}let g=new W(n.depot.x+1.5,0,n.depot.y-4),_=0,v=1,y=Bg,b=Bg,x=-1/0,S=2,C=()=>Rg[v],w=new W,T=new W;function E(){w.set(-Math.sin(y),0,-Math.cos(y)),T.set(-w.z,0,w.x)}function D(e){_+=e,b=y,x=we,S=2}function ee(){let e=Math.min(1,(we-x)/Wg),t=b+(Bg+_*Math.PI/2-b)*(1-(1-e)**3);t!==y&&(S=2),y=t}function O(e,t){E();let r=1/(C()*Lg);g.addScaledVector(T,-e*r).addScaledVector(w,t*r/Math.sin(zg)),g.x=pt.clamp(g.x,0,n.width),g.z=pt.clamp(g.z,0,n.height),S=2}function k(e){v=e,A()}function A(){let e=C(),t=Math.max(1,Math.ceil(innerWidth/e)),n=Math.max(1,Math.ceil(innerHeight/e));(a.width!==t||a.height!==n)&&a.resize(t,n),Jg.style.width=`${t*e}px`,Jg.style.height=`${n*e}px`,S=2}addEventListener(`resize`,A),A();let te=new Io,j=new U,M=new Wi(new W(0,1,0),0),N=new W;function P(e,n){let r=Jg.getBoundingClientRect();if(j.set((e-r.left)/r.width*2-1,-((n-r.top)/r.height)*2+1),a.camera.updateMatrixWorld(),te.setFromCamera(j,a.camera),!te.ray.intersectPlane(M,N))return null;let i={x:Math.floor(N.x),y:Math.floor(N.z)};return yp(t,i.x,i.y)?i:null}let F=null,I=null,L=null,ne=[];function re(){if(!F){I=null,L=null;return}let e=a.pick(F.x,F.y);I=o.terrainOf(e?.object??null)??P(F.x,F.y),L=o.buildingOf(e?.object??null),L===null&&I&&(L=xp(t,I.x,I.y)?.id??null)}function ie(e){let t=e.flatMap(e=>o.objectsOf(e)).slice(0,4);for(let e of ne)t.includes(e)||(e.highlight=!1);for(let e of t)e.highlight=!0;ne=t}let R=new Map,ae=new Map,oe=new J(9502608),se=new J(16732224);function ce(e,t,n,r,i,o=0,s){let c=R.get(e)??[];R.set(e,c);let l=ae.get(e)??0;ae.set(e,l+1);let u=c[l];u||(u=a.addObject(t),u.castShadow=!1,c.push(u)),u.visible=!0,s!==void 0&&(u.opacity=.6,u.tint=s?oe:se,u.tintStrength=.45),u.setTransform(new W(n,r,i),new Tn(0,o,0))}function le(){for(let e of R.values())for(let t of e)t.visible=!1;ae=new Map}let ue=[Math.PI,Math.PI/2,0,-Math.PI/2],de=(e,t)=>({x:e.x-Math.floor((t-1)/2),y:e.y-Math.floor((t-1)/2)});function z(e,t,n,r){if(e===`belt`)return Gm(t,n,r);let i=Ff[e].size,a=de(t,i),o=de(n,i),s=Math.abs(o.x-a.x)>=Math.abs(o.y-a.y),c=Math.floor(Math.abs(s?o.x-a.x:o.y-a.y)/i),l=s?Math.sign(o.x-a.x)*i:0,u=s?0:Math.sign(o.y-a.y)*i;return Array.from({length:c+1},(e,t)=>({x:a.x+l*t,y:a.y+u*t,rot:r}))}function fe(){if(le(),s.visible=!1,I||V){if(d.kind===`build`){let e=d.type,n=Ff[e].size,i=V?.mode===`paint`&&V.from&&V.to?z(e,V.from,V.to,d.rot):I?[{...de(I,n),rot:d.rot}]:[],a=t.credits;for(let o of i){let i=Um(t,e,o.x,o.y).ok&&a>=Ff[e].cost;i&&!t.scenario.sandbox&&(a-=Ff[e].cost);let s=o.x+n/2,c=o.y+n/2;ce(`frame ${i} ${n}`,(i?r.frames.ok:r.frames.bad)[n-1],s,.03,c),ce(`b ${e}`,r.buildings[e].idle,s,.04,c,ue[o.rot],i)}e===`pylon`&&i.length===1&&me(`power`),e===`sprinkler`&&me(`water`),e===`hive`&&me(`bees`)}else if(d.kind===`remove`&&V?.mode===`paint`&&V.from&&V.to){let e=Math.min(V.from.x,V.to.x),t=Math.max(V.from.x,V.to.x),n=Math.min(V.from.y,V.to.y),i=Math.max(V.from.y,V.to.y);for(let a=n;a<=i;a++)for(let n=e;n<=t;n++)ce(`frame false 1`,r.frames.bad[0],n+.5,.03,a+.5)}else I&&d.kind!==`link`&&(s.visible=!0,s.setTransform(new W(I.x+.5,.03,I.y+.5)))}}let pe=`none`,me=e=>{pe=e};function B(e,n){F={x:e,y:n},re();let r=I;switch(d.kind){case`select`:f=L,m.refresh();return;case`build`:{if(!r)return;let e=Ff[d.type].size,n=de(r,e),i=Wm(t,d.type,n.x,n.y,d.rot);i.message&&m.toast(i.message,i.ok);return}case`remove`:{let e=L===null?null:Sp(t,L);if(!e&&!r)return;let n=e?Km(t,e):qm(t,r.x,r.y);n.message&&m.toast(n.message,n.ok),f!==null&&!Sp(t,f)&&(f=null);return}case`link`:{let e=Sp(t,d.pad),n=L===null?null:Sp(t,L);if(e&&n){let r=$m(t,e,n);m.toast(r.message,r.ok),r.ok&&(h({kind:`select`}),f=e.id)}return}}}function he(){if(V?.from&&V.to){if(d.kind===`build`){let e=0,n=``;for(let r of z(d.type,V.from,V.to,d.rot)){let i=Wm(t,d.type,r.x,r.y,r.rot);i.ok?e++:i.message&&(n=i.message)}e?m.toast(`Built ${e} × ${Ff[d.type].name.toLowerCase()}.`,!0):n&&m.toast(n,!1)}else if(d.kind===`remove`){let e=Math.min(V.from.x,V.to.x),n=Math.max(V.from.x,V.to.x),r=Math.min(V.from.y,V.to.y),i=Math.max(V.from.y,V.to.y),a=0,o=new Set;for(let s=r;s<=i;s++)for(let r=e;r<=n;r++){let e=xp(t,r,s);if(e){if(o.has(e.id)||e.type===`depot`)continue;o.add(e.id)}qm(t,r,s).ok&&a++}a&&m.toast(`Removed ${a} thing${a>1?`s`:``}.`,!0),f!==null&&!Sp(t,f)&&(f=null)}}}let V=null;Jg.addEventListener(`pointerdown`,e=>{if(!e.isPrimary||V)return;F={x:e.clientX,y:e.clientY};let t=P(e.clientX,e.clientY);V={id:e.pointerId,x:e.clientX,y:e.clientY,button:e.button,mode:`click`,from:t,to:t},Jg.setPointerCapture(e.pointerId),S=2}),Jg.addEventListener(`pointermove`,e=>{if(V&&e.pointerId===V.id){let t=Math.hypot(e.clientX-V.x,e.clientY-V.y)>=Vg;if(V.mode===`click`&&t){let t=V.button===0&&!e.shiftKey&&(d.kind===`build`||d.kind===`remove`)&&V.from;V.mode=t?`paint`:`pan`,V.mode===`pan`&&(Jg.style.cursor=`grabbing`,O(e.clientX-V.x,e.clientY-V.y))}else V.mode===`pan`&&O(e.clientX-F.x,e.clientY-F.y);V.mode===`paint`&&(V.to=P(e.clientX,e.clientY)??V.to)}e.isPrimary&&(F={x:e.clientX,y:e.clientY},S=2)});function ge(e){if(!V||e.pointerId!==V.id)return;let t=V;V=null,Jg.style.cursor=``,e.type===`pointerup`&&(t.mode===`paint`?(V=t,he(),V=null):t.mode===`click`&&(t.button===0?B(e.clientX,e.clientY):t.button===2&&(d.kind===`select`?f=null:h({kind:`select`}),m.refresh())),S=2)}Jg.addEventListener(`pointerup`,ge),Jg.addEventListener(`pointercancel`,ge),Jg.addEventListener(`pointerleave`,e=>{!V&&e.isPrimary&&(F=null,S=2)}),Jg.addEventListener(`contextmenu`,e=>e.preventDefault());let _e=0,ve=-1/0,ye=!1;Jg.addEventListener(`wheel`,e=>{e.preventDefault(),!(e.ctrlKey||e.deltaY===0)&&((e.timeStamp-ve>Ug||Math.sign(e.deltaY)!==Math.sign(_e))&&(_e=0,ye=!1),ve=e.timeStamp,!ye&&(_e+=e.deltaMode===WheelEvent.DOM_DELTA_PIXEL?e.deltaY:Math.sign(e.deltaY)*Hg,!(Math.abs(_e)<Hg)&&(k(pt.clamp(v-Math.sign(_e),0,Rg.length-1)),ye=!0)))},{passive:!1});let be=new Set;addEventListener(`keydown`,e=>{if(e.ctrlKey||e.metaKey||e.altKey||e.target?.tagName===`INPUT`||e.target?.tagName===`SELECT`)return;if(be.add(e.code),e.code===`Escape`){if(V?.mode===`paint`){V.mode=`void`;return}if(m.closeTop())return;if(d.kind!==`select`){h({kind:`select`}),m.refresh();return}if(f!==null){f=null,m.refresh();return}m.openPause();return}if(e.repeat)return;if(e.code===`Space`){e.preventDefault(),l=!l;return}if(e.code===`Digit1`&&(c=1,l=!1),e.code===`Digit2`&&(c=2,l=!1),e.code===`Digit3`&&(c=4,l=!1),e.code===`KeyQ`&&D(-1),e.code===`KeyE`&&D(1),e.code===`KeyZ`&&k((v+1)%Rg.length),e.code===`Tab`&&(e.preventDefault(),m.toggleStats()),e.code===`KeyV`){let e=[`none`,`fertility`,`power`,`water`,`bees`];u=e[(e.indexOf(u)+1)%e.length]}if(e.code===`KeyX`&&h(d.kind===`remove`?{kind:`select`}:{kind:`remove`}),e.code===`KeyR`){if(d.kind===`build`)d={...d,rot:(d.rot+(e.shiftKey?3:1))%4},S=2;else if(f!==null){let e=Sp(t,f);e&&Ff[e.type].directional&&Jm(t,e)}}let n=e.code.startsWith(`Key`)?e.code.slice(3):``,r=Object.keys(Ff).find(e=>Ff[e].key===n);r&&h(d.kind===`build`&&d.type===r?{kind:`select`}:{kind:`build`,type:r,rot:d.kind===`build`?d.rot:1}),m.refresh()}),addEventListener(`keyup`,e=>be.delete(e.code)),addEventListener(`blur`,()=>be.clear());function xe(){if(d.kind===`link`)return`Click a receiving pad or the depot to link. Esc cancels.`;let e=L===null?null:Sp(t,L);if(d.kind===`build`&&I){let e=Ff[d.type].size,n=de(I,e),r=Um(t,d.type,n.x,n.y);return`${`${Ff[d.type].name} · ${t.scenario.sandbox?`free`:`${Ff[d.type].cost} credits`}`}${d.type===`field`?` · soil ${Math.round(Se(n.x,n.y))}`:``}\n${r.ok?Ff[d.type].directional?`Click or drag to build · R turns`:`Click or drag to build`:r.message}`}if(e)return`${Ff[e.type].name}: ${zm(t,e)}${e.type===`field`?` · soil ${Math.round(qp(t,e))}`:``}`;if(!I)return null;let r=Cp(t,I.x,I.y);return r===ep.water?`Water. Belts, crossings and pylons can bridge it.`:r===ep.tree?`A tree: shelters wind turbines nearby. Remove (X) for 5 credits.`:r===ep.rock?`Rock. Remove (X) for 15 credits.`:`Grass · soil fertility ${t.map.fertility[I.y*n.width+I.x]}`}function Se(e,r){let i=0,a=0;for(let o=r;o<r+3;o++)for(let r=e;r<e+3;r++)yp(t,r,o)&&(i+=t.map.fertility[o*n.width+r],a++);return a?i/a:0}let Ce=performance.now(),we=0,Te=0,Ee=NaN,De=0,Oe=t.completedAt!==null;function ke(e){let n=Math.min((e-Ce)/1e3,.1);if(Ce=e,we+=n,Te++,!l&&!m.modal&&km(t,n*c,qg),!Oe&&t.completedAt!==null){Oe=!0;let e=Rm(t.scenario.par,t.completedAt);localStorage.setItem(Zg,JSON.stringify(yh(_h(localStorage.getItem(Zg)),t.scenario.id,e,t.completedAt))),p(),m.showComplete(e)}De+=n,De>Kg&&(De=0,p());let r=+!!be.has(`ArrowRight`)-!!be.has(`ArrowLeft`),i=+!!be.has(`ArrowDown`)-!!be.has(`ArrowUp`);(r||i)&&O(-r*n*600,-i*n*600);let s=Np(t.time);Math.abs(s-Ee)<=.02||(a.setLook(wf(s)),Ee=s),o.sync(t),pe=`none`,F&&Te%Gg===0&&(S=Math.max(S,1)),S>0&&(S--,re()),fe(),o.overlay(t,u===`none`?pe:u);let h=[];f!==null&&h.push(f),L!==null&&L!==f&&(d.kind===`select`||d.kind===`link`||d.kind===`remove`)&&h.push(L),d.kind===`link`&&h.unshift(d.pad),ie(h),m.setHover(xe()),m.update(),ee(),a.placeCamera(g,y,zg,a.height/Lg),a.renderGeometry(we),a.renderStyle(we),requestAnimationFrame(ke)}requestAnimationFrame(ke),Object.assign(window,{game:{get state(){return t},set state(e){t=e},renderer:a,view:o,hud:m,sizeOf:up}})}