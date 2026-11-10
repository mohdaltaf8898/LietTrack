import {MapTiles} from './UX';
import React, { useState, useEffect } from 'react';
import { MapContainer, Polyline, CircleMarker, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed } from 'lucide-react';
import { routes, campus } from './data';

const busIcon = L.divIcon({className:'bus-icon-wrap',html:'<div class="map-bus"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="16" rx="3"/><path d="M5 13h14M8 19v2m8-2v2M8 8h8M8 16h.01M16 16h.01"/></svg></div>',iconSize:[36,36],iconAnchor:[18,18]});
const campusIcon = L.divIcon({className:'campus-icon-wrap',html:'<div class="map-campus">LIET</div>',iconSize:[48,26],iconAnchor:[24,13]});
function Recenter({selected}) { const map=useMap(); useEffect(()=>{ if(selected) map.flyTo(selected.position, 12, {duration:0.8}); },[selected,map]); return null; }
function DashboardMapControls(){ const map=useMap(); const [message,setMessage]=useState(''); const [location,setLocation]=useState(null); const locate=()=>{ if(!navigator.geolocation){setMessage('Location is not supported by your browser.');return;} setMessage('Finding your location…'); navigator.geolocation.getCurrentPosition(({coords})=>{setLocation([coords.latitude,coords.longitude]);map.flyTo([coords.latitude,coords.longitude],14);setMessage('Showing your location.');},()=>setMessage('Location unavailable. Check your browser permissions.')); }; const full=async()=>{try{const el=map.getContainer().parentElement;if(document.fullscreenElement) await document.exitFullscreen();else await el.requestFullscreen();setTimeout(()=>map.invalidateSize(),150);}catch{setMessage('Fullscreen is not available in this browser.')}}; return <><div className="dashboard-map-controls"><button type="button" title="Find my location" aria-label="Find my location" onClick={locate}><LocateFixed size={17}/></button><button type="button" title="Toggle fullscreen" aria-label="Toggle fullscreen" onClick={full}>⛶</button>{message&&<span role="status">{message}</span>}</div>{location&&<CircleMarker center={location} radius={7} pathOptions={{color:"#fff",weight:2,fillColor:"#246dc2",fillOpacity:1}}><Tooltip>Your location</Tooltip></CircleMarker>}</> }
export function TransitMap({selected=routes[0], all=false, compact=false, controls=false}) {
 return <div className={'map-shell '+(compact?'compact-map':'')}><MapContainer center={[17.385,78.387]} zoom={11} scrollWheelZoom={false} zoomControl={!compact} className="map" aria-label="Illustrative Hyderabad transit map">
  <MapTiles/>
  {(all?routes:[selected]).map(r=><React.Fragment key={r.id}><Polyline positions={r.points} pathOptions={{color:r.color,weight:5,opacity:.9}}/>{r.points.slice(0,-1).map((p,i)=><CircleMarker key={i} center={p} radius={5} pathOptions={{color:r.color,weight:3,fillColor:'#fff',fillOpacity:1}}><Tooltip>{i===0?r.from:`Sample stop ${i+1}`}</Tooltip></CircleMarker>)}<Marker position={r.position} icon={busIcon}><Tooltip>Demo bus {r.id}</Tooltip></Marker></React.Fragment>)}
  <Marker position={campus} icon={campusIcon}><Tooltip>Illustrative campus destination</Tooltip></Marker>{!compact && <Recenter selected={selected}/ >}{controls && <DashboardMapControls/>}</MapContainer><div className="map-demo"><span className="demo-dot"/> DEMO MAP</div></div>
}
