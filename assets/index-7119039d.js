import{b as v,o as I,g as m,d as X,t as x,s as _,e as z,a as f,i as c,c as h,f as k,r as Y,h as Z}from"./entry-client-a6165289.js";const P="#FF0800",F="#000000",[q,V]=v(P),[G,K]=v(F),[O,R]=v([]),W=()=>O().length===0,T=t=>{const s=$();s&&(s.strokeStyle=t)},J=(t=G())=>T(t),Q=(t=q())=>T(t),tt=x('<div class="relative flex justify-center"><div class="absolute image-prompt">Upload an image to begin</div><canvas id="main-canvas">Image canvas not loaded'),p="main-canvas",L=t=>({mouseX:t.offsetX,mouseY:t.offsetY}),[E,D]=v(null),A=()=>E()!==null,[$,et]=v(null),[nt,st]=v(null),lt=()=>{const t=document.querySelector(`#${p}`),s=t.getBoundingClientRect(),n=t?.getContext("2d");et(n),st(s);const e=a=>{if(a.target.id!==p)return;const{mouseX:d,mouseY:u}=L(a);D([d,u]),t.style.cursor="crosshair"},o=a=>{if(a.target.id!==p||!A())return;const{mouseX:d,mouseY:u}=L(a),[r,g]=E(),S=Math.abs(d-r),b=Math.abs(u-g);if(!(S<=10||b<=10))return t.style.cursor="default",R(y=>[...y,{startX:r,startY:g,width:d-r,height:u-g}]),C(),D(null)},l=a=>{if(a.target.id!=p||!A())return;C();const{mouseX:d,mouseY:u}=L(a),[r,g]=E();n.save(),n.beginPath(),Q(),n.setLineDash([6]),n.strokeRect(r,g,d-r,u-g),n.restore()},i=a=>{a.code==="Escape"&&(D(null),C(),t.style.cursor="default")};t.addEventListener("mousemove",l,!1),t.addEventListener("mousedown",e,!1),t.addEventListener("mouseup",o,!1),window.addEventListener("keydown",i,!1)},ot={width:500,height:300,imgData:null},[w,at]=v(ot),it=()=>{const t=document.querySelector("#upload-input"),s=n=>{if(n.target.files.length===0)return;const e=$();if(!e)return;const o=n.target.files[0],l=new Image;l.onload=()=>{at({width:l.width,height:l.height,imgData:l}),e.drawImage(l,0,0)},l.src=URL.createObjectURL(o)};t.addEventListener("change",s)},C=()=>{const t=$(),s=nt();if(!t||!s)return;const{imgData:n}=w();if(!n)return console.error("no image data in redrawAllBoxes");t.clearRect(0,0,s.width,s.height),t.drawImage(n,0,0),O().forEach(e=>{t.beginPath(),t.rect(e.startX,e.startY,e.width,e.height),J(),t.stroke()})},rt=()=>{const t=$();t&&(t.reset(),R([]))},ct=()=>{$()&&(R(t=>t.slice(0,t.length-1)),C())},dt=()=>{$()},ut=()=>(I(()=>lt()),I(()=>it()),(()=>{const t=m(tt),s=t.firstChild,n=s.nextSibling;return X(e=>{const o=w().width,l=w().height,i="relative rounded-md"+w().imgData?"canvas-shadow-active":"canvas-shadow-inactive";return o!==e._v$&&_(n,"width",e._v$=o),l!==e._v$2&&_(n,"height",e._v$2=l),i!==e._v$3&&z(n,e._v$3=i),e},{_v$:void 0,_v$2:void 0,_v$3:void 0}),t})()),gt=x('<svg fill="currentColor" stroke-width="0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="1em" width="1em" style="overflow:visible;"><path d="m1 1.91.78-.41L15 7.449v.95L1.78 14.33 1 13.91 2.583 8 1 1.91ZM3.612 8.5 2.33 13.13 13.5 7.9 2.33 2.839l1.282 4.6L9 7.5v1H3.612Z">'),ht=x('<svg fill="currentColor" stroke-width="0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="1em" width="1em" style="overflow:visible;"><path d="M8 1a7.979 7.979 0 0 0-5.657 2.343L0 1v6h6L3.757 4.757a6 6 0 1 1 8.211 8.743l1.323 1.5A8 8 0 0 0 8 1z">'),ft=x('<svg fill="currentColor" stroke-width="0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="1em" width="1em" style="overflow:visible;"><path d="M12 16c1.671 0 3-1.331 3-3s-1.329-3-3-3-3 1.331-3 3 1.329 3 3 3z"></path><path d="M20.817 11.186a8.94 8.94 0 0 0-1.355-3.219 9.053 9.053 0 0 0-2.43-2.43 8.95 8.95 0 0 0-3.219-1.355 9.028 9.028 0 0 0-1.838-.18V2L8 5l3.975 3V6.002c.484-.002.968.044 1.435.14a6.961 6.961 0 0 1 2.502 1.053 7.005 7.005 0 0 1 1.892 1.892A6.967 6.967 0 0 1 19 13a7.032 7.032 0 0 1-.55 2.725 7.11 7.11 0 0 1-.644 1.188 7.2 7.2 0 0 1-.858 1.039 7.028 7.028 0 0 1-3.536 1.907 7.13 7.13 0 0 1-2.822 0 6.961 6.961 0 0 1-2.503-1.054 7.002 7.002 0 0 1-1.89-1.89A6.996 6.996 0 0 1 5 13H3a9.02 9.02 0 0 0 1.539 5.034 9.096 9.096 0 0 0 2.428 2.428A8.95 8.95 0 0 0 12 22a9.09 9.09 0 0 0 1.814-.183 9.014 9.014 0 0 0 3.218-1.355 8.886 8.886 0 0 0 1.331-1.099 9.228 9.228 0 0 0 1.1-1.332A8.952 8.952 0 0 0 21 13a9.09 9.09 0 0 0-.183-1.814z">'),mt=x('<div class="flex flex-col items-center"><input type="color"><label class="text-neutral-500">'),xt=x('<button class="tool-button cursor-pointer"><!#><!/><label class="text-neutral-500 hover:text-sky-600 cursor-pointer">'),vt=x('<button class="flex items-center gap-2 bg-green-600 disabled:bg-neutral-700 rounded-sm p-2 duration-300"><span>Submit</span><!#><!/>'),_t=x('<div class="text-white text-md flex justify-center gap-4 items-start"><!#><!/><!#><!/><div class="mt-4 gap-4 flex text-center"><input type="file" accept="image/*" id="upload-input" class="w-32"></div><!#><!/><!#><!/><!#><!/>'),$t=()=>m(gt),bt=()=>m(ht),pt=({cls:t})=>(()=>{const s=m(ft);return _(s,"class",t),s})(),M=({id:t,label:s,onChange:n,defaultColor:e})=>(()=>{const o=m(mt),l=o.firstChild,i=l.nextSibling;return k(l,"change",n),_(l,"id",t),_(l,"name",t),l.value=e,_(i,"for",t),c(i,s),o})(),U=({icon:t,label:s,onClick:n})=>(()=>{const e=m(xt),o=e.firstChild,[l,i]=f(o.nextSibling),a=l.nextSibling;return k(e,"click",n,!0),c(e,t,l,i),c(a,s),Y(),e})(),wt=()=>(()=>{const t=m(vt),s=t.firstChild,n=s.nextSibling,[e,o]=f(n.nextSibling);return c(t,h($t,{}),e,o),X(()=>t.disabled=W()),t})(),Ct=()=>(()=>{const t=m(_t),s=t.firstChild,[n,e]=f(s.nextSibling),o=n.nextSibling,[l,i]=f(o.nextSibling),a=l.nextSibling,d=a.firstChild,u=a.nextSibling,[r,g]=f(u.nextSibling),S=r.nextSibling,[b,y]=f(S.nextSibling),H=b.nextSibling,[N,j]=f(H.nextSibling);return c(t,h(M,{id:"drawing-color",label:"Drawing",defaultColor:P,onChange:B=>V(B.target.value)}),n,e),c(t,h(M,{id:"box-color",label:"Box",defaultColor:F,onChange:B=>K(B.target.value)}),l,i),k(d,"click",dt,!0),c(t,h(U,{get icon(){return h(bt,{})},label:"Undo",onClick:ct}),r,g),c(t,h(U,{get icon(){return h(pt,{cls:"text-lg"})},label:"Reset",onClick:rt}),b,y),c(t,h(wt,{}),N,j),Y(),t})();Z(["click"]);const St=x('<div class="text-center flex flex-col items-center flex-auto"><main class="flex flex-col"><div class="flex flex-col mb-24"><h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-4">Capstone</h1><p class="text-md text-neutral-500">Tips</p><ul class="mb-8"><li class="basic-text">- Press ctrl + Z to undo last box</li><li class="basic-text">- Press Esc to stop drawing</li></ul><!#><!/></div><!#><!/>');function Bt(){return(()=>{const t=m(St),s=t.firstChild,n=s.firstChild,e=n.firstChild,o=e.nextSibling,l=o.nextSibling,i=l.nextSibling,[a,d]=f(i.nextSibling),u=n.nextSibling,[r,g]=f(u.nextSibling);return c(n,h(Ct,{}),a,d),c(s,h(ut,{}),r,g),t})()}export{Bt as default};
