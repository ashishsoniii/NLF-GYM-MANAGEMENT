import{i as u,a9 as W,aa as k,v as l,ab as v,r as R,_ as G,j as $,y as S,n as T,e as y,s as M,t as P}from"./index-082a7ee0.js";const j=["className","component","disableGutters","fixed","maxWidth","classes"],L=W(),N=k("div",{name:"MuiContainer",slot:"Root",overridesResolver:(a,e)=>{const{ownerState:o}=a;return[e.root,e[`maxWidth${l(String(o.maxWidth))}`],o.fixed&&e.fixed,o.disableGutters&&e.disableGutters]}}),_=a=>v({props:a,name:"MuiContainer",defaultTheme:L}),U=(a,e)=>{const o=i=>y(e,i),{classes:p,fixed:c,disableGutters:x,maxWidth:t}=a,s={root:["root",t&&`maxWidth${l(String(t))}`,c&&"fixed",x&&"disableGutters"]};return T(s,o,p)};function w(a={}){const{createStyledComponent:e=N,useThemeProps:o=_,componentName:p="MuiContainer"}=a,c=e(({theme:t,ownerState:s})=>u({width:"100%",marginLeft:"auto",boxSizing:"border-box",marginRight:"auto",display:"block"},!s.disableGutters&&{paddingLeft:t.spacing(2),paddingRight:t.spacing(2),[t.breakpoints.up("sm")]:{paddingLeft:t.spacing(3),paddingRight:t.spacing(3)}}),({theme:t,ownerState:s})=>s.fixed&&Object.keys(t.breakpoints.values).reduce((i,n)=>{const d=n,r=t.breakpoints.values[d];return r!==0&&(i[t.breakpoints.up(d)]={maxWidth:`${r}${t.breakpoints.unit}`}),i},{}),({theme:t,ownerState:s})=>u({},s.maxWidth==="xs"&&{[t.breakpoints.up("xs")]:{maxWidth:Math.max(t.breakpoints.values.xs,444)}},s.maxWidth&&s.maxWidth!=="xs"&&{[t.breakpoints.up(s.maxWidth)]:{maxWidth:`${t.breakpoints.values[s.maxWidth]}${t.breakpoints.unit}`}}));return R.forwardRef(function(s,i){const n=o(s),{className:d,component:r="div",disableGutters:b=!1,fixed:f=!1,maxWidth:C="lg"}=n,g=G(n,j),m=u({},n,{component:r,disableGutters:b,fixed:f,maxWidth:C}),h=U(m,p);return $.jsx(c,u({as:r,ownerState:m,className:S(h.root,d),ref:i},g))})}const z=w({createStyledComponent:M("div",{name:"MuiContainer",slot:"Root",overridesResolver:(a,e)=>{const{ownerState:o}=a;return[e.root,e[`maxWidth${l(String(o.maxWidth))}`],o.fixed&&e.fixed,o.disableGutters&&e.disableGutters]}}),useThemeProps:a=>P({props:a,name:"MuiContainer"})}),D=z;export{D as C};
