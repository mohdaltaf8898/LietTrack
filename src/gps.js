export function gpsStatus(gps, now=Date.now()) {
 if (!gps || gps.source==='offline') return 'OFFLINE';
 if (gps.source==='simulated') return 'DEMO';
 const age=now-Date.parse(gps.recorded_at);
 if (!Number.isFinite(age) || age < -15000 || age > 180000) return 'OFFLINE';
 return age <= 45000 ? 'LIVE' : 'STALE';
}
export function distance(a,b){const rad=Math.PI/180;const dlat=(b[0]-a[0])*rad,dlon=(b[1]-a[1])*rad;const h=Math.sin(dlat/2)**2+Math.cos(a[0]*rad)*Math.cos(b[0]*rad)*Math.sin(dlon/2)**2;return 12742000*Math.asin(Math.min(1,Math.sqrt(h)))}
export function validPosition(p, now=Date.now()){const c=p?.coords,t=p?.timestamp;return !!c && Number.isFinite(c.latitude)&&Math.abs(c.latitude)<=90&&Number.isFinite(c.longitude)&&Math.abs(c.longitude)<=180&&Number.isFinite(c.accuracy)&&c.accuracy>=0&&c.accuracy<=100&&Number.isFinite(t)&&t>=now-90000&&t<=now+15000&& (c.speed==null||(Number.isFinite(c.speed)&&c.speed>=0&&c.speed<=80))&&(c.heading==null||(Number.isFinite(c.heading)&&c.heading>=0&&c.heading<360))}
// Stop-to-stop lines are the only stored route geometry. Projection is approximate, not road or traffic aware.
export function estimateRoute(gps,stops){if(!gps||!Array.isArray(stops)||stops.length<2||stops.some(s=>!Number.isFinite(s.latitude)||!Number.isFinite(s.longitude)))return null;const p=[gps.latitude,gps.longitude], points=stops.map(s=>[s.latitude,s.longitude]);let best=null;for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],scale=Math.cos(p[0]*Math.PI/180),dx=(b[1]-a[1])*scale,dy=b[0]-a[0],den=dx*dx+dy*dy;if(!den)continue;const t=Math.max(0,Math.min(1,(((p[1]-a[1])*scale)*dx+(p[0]-a[0])*dy)/den));const projected=[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])];const off=distance(p,projected);if(!best||off<best.off)best={i,t,projected,off}}
 if(!best||best.off>1000)return null;const next=stops[best.i+1], meters=distance(best.projected,points[best.i+1]);const speed=gps.speed>=2&&gps.speed<=30?gps.speed:5.5;return {next:next.name,meters,minutes:Math.max(1,Math.round(meters/speed/60)),assumed:!(gps.speed>=2&&gps.speed<=30)};
}
