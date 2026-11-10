// Illustrative destination only. Replace with verified LIET campus coordinates when available.
export const campus = [17.337, 78.351];

export const routes = [
  { id:'12', name:'Gopanpally – LIET Campus', from:'Gopanpally', via:'Main Pickup Point', eta:'12 min', color:'#147354', points:[[17.457,78.291],[17.435,78.298],[17.405,78.306],[17.369,78.328],campus], position:[17.405,78.306], status:'On route', bus:'LIET-12', pickup:'Main Pickup Point', driver:'Demo driver', stops:[{name:'Gopanpally', time:'8:00 AM', state:'completed'},{name:'Main Pickup Point', time:'8:12 AM', state:'upcoming'},{name:'Intermediate stop', time:'8:25 AM', state:'upcoming'},{name:'LIET Campus', time:'8:45 AM', state:'upcoming'}] },
  { id:'01', name:'Mehdipatnam route', from:'Mehdipatnam', via:'Attapur', eta:'12 min', color:'#386e90', points:[[17.3944,78.4384],[17.383,78.422],[17.367,78.403],[17.353,78.375],campus], position:[17.367,78.403], status:'On the way' },
  { id:'02', name:'Gachibowli route', from:'Gachibowli', via:'Nanakramguda', eta:'18 min', color:'#ca8849', points:[[17.440,78.348],[17.422,78.35],[17.403,78.349],[17.373,78.352],campus], position:[17.403,78.349], status:'On the way' },
  { id:'03', name:'Rajendranagar route', from:'Rajendranagar', via:'Himayat Sagar', eta:'24 min', color:'#7389a0', points:[[17.323,78.41],[17.324,78.39],[17.33,78.37],campus], position:[17.324,78.39], status:'On the way' }
];

export const student = { name: "Student", initials: "S", role: "LIET student" };
export const notifications = [ { title: "Your bus has started its journey.", detail: "Sample journey update", icon: "bus" }, { title: "Your bus is approaching your pickup stop.", detail: "Sample arrival update", icon: "location" }, { title: "Today’s transport schedule updated.", detail: "Sample schedule update", icon: "schedule" } ];

/** @typedef {{id:string, name:string, latitude:number, longitude:number}} Stop */
/** @typedef {{id:string, routeName:string, routeColor:string, stops:Stop[], coordinates:number[][]}} TransitRoute */
/** @typedef {{id:string, busNumber:string, routeId:string, driverName:string, latitude:number, longitude:number, speed:number, heading:number, status:string, nextStopId:string, eta:string, lastUpdated:string|null}} Bus */

// The tracking model derives from the same examples used by the dashboard and route explorer.
// Coordinates, timing and vehicle details are illustrative; no GPS feed is connected.
/** @type {TransitRoute[]} */
export const transitRoutes = routes.map((route, routeIndex) => {
  const labels = route.stops?.map(stop => stop.name) || [route.from, route.via, 'Campus destination'];
  const indices = labels.map((_, index) => Math.round(index * (route.points.length - 1) / (labels.length - 1)));
  return { id: route.id, routeName: route.name, routeColor: route.color, coordinates: route.points, duration: [45, 50, 55, 40][routeIndex], status: "Active",
    stops: labels.map((name, index) => ({id: `${route.id}-${index}`, name, latitude: route.points[indices[index]][0], longitude: route.points[indices[index]][1], time: route.stops?.[index]?.time || `8:${String(index * 12).padStart(2, '0')} AM`, progress: index === 0 ? "completed" : index === 1 ? "current" : "upcoming"})) };
});
/** @type {Bus[]} */
export const buses = routes.map((route, index) => ({
  id: route.id, busNumber: route.bus || `LIET-${route.id}`, routeId: route.id,
  driverName: route.driver || 'Demo driver', latitude: route.position[0], longitude: route.position[1],
  speed: [28, 24, 31, 22][index], heading: 180, status: 'On route',
  nextStopId: `${route.id}-1`, eta: route.eta, lastUpdated: null
}));
