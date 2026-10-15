export interface PreloadProgress { completed: number; total: number; failed: string[]; current: string }

/** Deduped, bounded work queue. Failed files never masquerade as decoded files. */
export async function preloadQueue(urls: string[], load: (url: string) => Promise<boolean>,
  progress: (state: PreloadProgress) => void, signal?: AbortSignal, concurrency = 8): Promise<PreloadProgress> {
  const queue = [...new Set(urls)];
  let cursor = 0;
  const state: PreloadProgress = {completed:0,total:queue.length,failed:[],current:""};
  const snapshot = () => ({...state,failed:[...state.failed]});
  progress(snapshot());
  const worker = async () => {
    while (!signal?.aborted) {
      const index = cursor++;
      if (index >= queue.length) return;
      const url = queue[index];
      let ok=false;
      try { ok=await load(url); } catch { ok=false; }
      if (signal?.aborted) return;
      if (!ok) state.failed.push(url);
      state.completed++;
      state.current=url;
      progress(snapshot());
    }
  };
  await Promise.all(Array.from({length:Math.max(1,Math.min(concurrency,16))},worker));
  return snapshot();
}

export function decodeImage(url: string, signal?: AbortSignal, timeoutMs=12000): Promise<boolean> {
  return new Promise(resolve => {
    if (signal?.aborted) {resolve(false);return;}
    const image=new Image();
    let settled=false;
    const finish=(ok:boolean) => {
      if(settled)return;
      settled=true;
      clearTimeout(timer);
      signal?.removeEventListener("abort",abort);
      image.onload=null;image.onerror=null;
      resolve(ok);
    };
    const abort=()=>{finish(false);image.src="";};
    const timer=window.setTimeout(()=>{finish(false);image.src="";},timeoutMs);
    signal?.addEventListener("abort",abort,{once:true});
    image.onerror=()=>finish(false);
    image.onload=()=>void image.decode().then(()=>finish(true),()=>finish(false));
    image.src=url;
  });
}