import { useEffect, useRef, type RefObject } from "react";

export function useDialogFocus(ref:RefObject<HTMLElement|null>,open:boolean,onClose:()=>void){
 const close=useRef(onClose);close.current=onClose;
 useEffect(()=>{
  if(!open)return;
  const previous=document.activeElement as HTMLElement|null;
  const panel=ref.current;if(!panel)return;
  panel.focus();
  const keys=(event:KeyboardEvent)=>{
   if(event.key==="Escape"){event.preventDefault();close.current();return;}
   if(event.key!=="Tab")return;
   const focusable=Array.from(panel.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]')).filter(el=>el.getClientRects().length>0);
   const first=focusable[0],last=focusable[focusable.length-1];
   if(!first){event.preventDefault();panel.focus();return;}
   if(event.shiftKey&&(document.activeElement===first||document.activeElement===panel)){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  };
  window.addEventListener("keydown",keys);
  return()=>{window.removeEventListener("keydown",keys);if(previous?.isConnected)previous.focus();};
 },[open,ref]);
}