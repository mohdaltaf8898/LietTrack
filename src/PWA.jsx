import React, {useEffect, useState} from 'react';
import './pwa.css';

export function PWA() {
  const [prompt, setPrompt] = useState(null);
  const [waiting, setWaiting] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const install = event => { event.preventDefault(); setPrompt(event); };
    const installed = () => setPrompt(null);
    window.addEventListener('beforeinstallprompt', install);
    window.addEventListener('appinstalled', installed);
    let registration, onUpdate, active = true;
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/service-worker.js').then(reg => {
        if (!active) return;
        registration = reg;
        if (reg.waiting && navigator.serviceWorker.controller) setWaiting(reg.waiting);
        onUpdate = () => {
          const worker = reg.installing;
          worker?.addEventListener('statechange', () => {
            if (active && worker.state === 'installed' && navigator.serviceWorker.controller) setWaiting(worker);
          });
        };
        reg.addEventListener('updatefound', onUpdate);
      }).catch(() => {});
    }
    return () => {active = false; window.removeEventListener('beforeinstallprompt', install); window.removeEventListener('appinstalled', installed); if (registration && onUpdate) registration.removeEventListener('updatefound', onUpdate);};
  }, []);
  async function installApp() { if (!prompt) return; await prompt.prompt(); setPrompt(null); }
  function update() {
    if (!waiting) return;
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), {once:true});
    waiting.postMessage({type:'SKIP_WAITING'});
  }
  if (!waiting && (!prompt || dismissed)) return null;
  return <aside className="pwa-notice" aria-label="LIETTrack app" role="status">{waiting ? <><span>An updated version is available.</span><button type="button" onClick={update}>Update now</button></> : <><span>Install LIETTrack for quick access.</span><button type="button" onClick={installApp}>Install</button><button type="button" aria-label="Dismiss install suggestion" onClick={()=>setDismissed(true)}>×</button></>}</aside>;
}
