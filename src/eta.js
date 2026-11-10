import {distance,gpsStatus} from './gps.js';
export const istDate = (date=new Date()) => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
export function addDays(date,days){const d=new Date(`${date}T00:00:00Z`);d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10)}
export function operates(s,date){const day=new Date(date+'T00:00:00Z').getUTCDay()||7;return date>=s.valid_from&&date<=s.valid_until&&s.days.includes(day)}
export function arrivalEpoch(date,time){return Date.parse(`${date}T${time.slice(0,8).length===5?time.slice(0,5)+':00':time.slice(0,8)}+05:30`)}
export function upcomingEstimates(gps,stops,historySeconds,now=Date.now()){
 if(gpsStatus(gps,now)!=='LIVE'||!gps?.trip_id||!Array.isArray(stops)||stops.length<2||stops.some(s=>!Number.isFinite(s.latitude)||!Number.isFinite(s.longitude)))return null;
 if(Number.isFinite(gps.speed)&&gps.speed<0.5)return {stopped:true,items:[]};
 const point=[gps.latitude,gps.longitude],points=stops.map(s=>[s.latitude,s.longitude]);let nearest=null,total=0;
 for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],scale=Math.cos(point[0]*Math.PI/180),dx=(b[1]-a[1])*scale,dy=b[0]-a[0],den=dx*dx+dy*dy;total+=distance(a,b);if(!den)continue;const t=Math.max(0,Math.min(1,(((point[1]-a[1])*scale)*dx+(point[0]-a[0])*dy)/den)),projection=[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])],off=distance(point,projection);if(!nearest||off<nearest.off)nearest={i,projection,off}}
 if(!nearest||nearest.off>1000)return null;
 const historical=Number(historySeconds)>0?total/Number(historySeconds):null;const measured=Number.isFinite(gps.speed)&&gps.speed>=2&&gps.speed<=30;const speed=measured?Math.min(20,Math.max(2,gps.speed)):historical>=2&&historical<=20?historical:5.5;const source=measured?'GPS speed':historical>=2&&historical<=20?'historical trip average':'assumed speed';let metres=distance(nearest.projection,points[nearest.i+1]);const items=[];for(let i=nearest.i+1;i<stops.length;i++){if(i>nearest.i+1)metres+=distance(points[i-1],points[i]);const minutes=Math.ceil(metres/speed/60);if(minutes<=240)items.push({id:stops[i].id,name:stops[i].name,minutes:Math.max(1,minutes),metres})}return {stopped:false,items,source,confidence:measured?'approximate':'low confidence'};
}
export function matchedSchedule(ctx,date){if(!ctx?.active_trip)return null;const matches=ctx.schedules.filter(s=>operates(s,date)&&Math.abs(Date.parse(ctx.active_trip.started_at)-arrivalEpoch(date,s.departure))<=30*60000);return matches.length===1?matches[0]:null}
export function deviation(eta,scheduled,threshold){if(!Number.isFinite(eta)||!Number.isFinite(scheduled))return null;const mins=Math.round((eta-scheduled)/60000);return {label:mins>=threshold?'Delayed':mins<=-threshold?'Early':'On time',minutes:Math.abs(mins)}}
