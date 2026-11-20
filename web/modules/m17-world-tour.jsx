/* ===== M17 WORLD TOUR (A1/A2: the 7 continents and the 7 oceans) =====
 * A world map. Each continent and each ocean is a button. There is a plane in one color.
 * The Expert finds the plane's color in the manual and reads a list of four places. The Defuser touches
 * them on the map, in that order. Each right place gets a pin and the plane flies there.
 * Wrong place: STRIKE, the pins go and the route starts again from place 1 (same plane, same list).
 * The 7 oceans are the "seven seas": North and South Pacific, North and South Atlantic, Indian, Arctic, Southern.
 * The Pacific is cut in two by the edge of the map, so each Pacific is two pieces with the same name.
 * Fixed manual (no sync number). The lists come from MANUAL.CYCLE, so a new cycle gives new lists.
 * Two versions, same lists generator (different lists):
 *   World Tour            (A1, puzzle 1) names on the map: listen, find the word, touch it.
 *   World Tour: Blank Map (A2, puzzle 2) no names on the Defuser's map. The Expert's manual has the map with
 *            names, so the Expert has to say where it is: "It's under Asia." "It's between Africa and Australia."
 * The map names say NORTH ATLANTIC, INDIAN…: italic blue words are oceans; the manual adds "Ocean".
 * Map: plain equirectangular, longitude -170..190 (cut in the Bering Strait), latitude 86..-80.
 */
(() => {
  const { useState, useRef, useEffect } = React;
  const TEST = {};

  /* --- the map --- */
  const W = 360, TOP = 86, BOTTOM = -80, H = TOP - BOTTOM;
  const X = (lon) => lon + 170, Y = (lat) => TOP - lat;
  const path = (pts) => "M" + pts.map(([lon, lat]) => `${X(lon).toFixed(1)},${Y(lat).toFixed(1)}`).join("L") + "Z";

  const LAND = {
    NA: [
      [[-168,65.5],[-162,70],[-156,71.3],[-141,69.6],[-128,70.2],[-115,68.5],[-100,68],[-94,71.5],[-85,69.8],[-82,66.5],[-87,64],[-93,61],[-94,58.8],
       [-90,57],[-82,55],[-80,51.5],[-79,54.5],[-77,59],[-78,62.3],[-73,62],[-69,59],[-64,60.5],[-61,56],[-56,52],[-59,48],[-65,48.8],[-61,45.5],
       [-66,44.5],[-70,42],[-74,40.5],[-76,37],[-75.5,35.2],[-81,31.5],[-80,27],[-80.5,25.2],[-82.5,27.8],[-84,30],[-89,30.2],[-94,29.6],[-97.3,27.5],
       [-97.7,22],[-96,19],[-94.5,18.2],[-91,19],[-90.4,21],[-87,21.5],[-88,16],[-84,15.8],[-83.4,11],[-81.5,9],[-79.5,9.5],[-77.4,8.5],[-78,7.2],
       [-80,7.4],[-83,8.2],[-86,11],[-88,13.3],[-92,14.5],[-96,15.7],[-101,17.3],[-105.7,20.4],[-105.3,23],[-108.5,25.5],[-111,28],[-114.7,31.7],
       [-113,29],[-110,24],[-109.5,23],[-112,24.8],[-114,27.5],[-115.8,30],[-117.1,32.5],[-120.6,34.5],[-122.5,37.7],[-124.2,40.4],[-124,46],
       [-124.7,48.4],[-127.5,50.5],[-130,54.5],[-134,58],[-137.5,58.8],[-140,60],[-146,60.8],[-152,59],[-154,57],[-158,56.5],[-162,55],[-164.5,54.5],
       [-158,58.5],[-162,58.7],[-165,60.5],[-165,62.5],[-164,64]],
      [[-73,78],[-60,82],[-40,83.5],[-22,82],[-18,77],[-20,72],[-22,70],[-32,68],[-40,65],[-43,60],[-48,61],[-52,65],[-54,69],[-56,72.5],[-66,76]],
      [[-80,73.5],[-70,70.5],[-64,67],[-62,66.5],[-66,64],[-72,62.5],[-78,64.5],[-74,67],[-80,70],[-89,73]],
      [[-120,72],[-110,73],[-100,74],[-90,75],[-80,76],[-75,79],[-62,82.5],[-80,83],[-95,81],[-105,78.5],[-118,76.5],[-125,74]],
      [[-118,69.5],[-105,69],[-101,70],[-104,72.5],[-112,73],[-118,71.5]],
      [[-78,22.5],[-74,20],[-77,19.8],[-80,21.6],[-84.9,21.9],[-83,23]], // Cuba
    ],
    SA: [[[-77.4,8.5],[-75.5,10.5],[-72,12],[-68,10.6],[-62,10.7],[-60,8.5],[-57,6],[-52,5],[-50,1.8],[-48.5,-1],[-44,-2.5],[-40,-3],[-35.2,-5.5],
      [-35,-9],[-39,-13.5],[-39,-17.5],[-40.5,-21.5],[-44,-23],[-48.5,-26],[-48.6,-28.5],[-51,-31],[-53.5,-34],[-57,-35],[-57.5,-38],[-62,-39],
      [-65,-41],[-63.5,-42.5],[-65.5,-45],[-67.5,-46.5],[-66,-48],[-69,-51],[-68.5,-52.5],[-67,-54.8],[-71,-55],[-74.5,-52.5],[-75.5,-48],[-74,-44],
      [-73.5,-40],[-73.5,-37],[-71.5,-32],[-71.5,-28],[-70.5,-23],[-70.2,-18.5],[-75,-15.5],[-77,-12],[-79.5,-7.5],[-81.2,-5.5],[-80.3,-3.4],
      [-80,-1],[-80,1],[-78.8,1.8],[-77.3,4],[-77.5,7]]],
    EU: [
      [[-9,43.5],[-9.5,39],[-8.9,37],[-6,36.2],[-2,36.8],[0,38.8],[0.5,40.5],[3.2,42],[3,43.3],[6,43.1],[8.5,44.3],[10.5,43],[12.5,41.5],[15.6,38.2],
       [16.2,38.9],[15.7,40],[17,39],[18.5,40.2],[16,41.5],[13.6,43.5],[12.4,45.4],[13.7,45.6],[15,44.6],[19.5,41.8],[19.4,40.3],[21,38.5],[22.5,36.5],
       [23.2,38.2],[24,40.6],[26,40.8],[28.9,41.1],[28,43],[28.6,44.5],[30,46],[31.5,46.6],[33.5,44.5],[36,45.3],[38,47],[39.5,47.2],[38.5,46],
       [37.6,45],[38.5,44.3],[40,43.4],[44,43],[47.5,43],[47.2,44.5],[49,46.4],[51.8,47],[51.5,50],[55,51],[58.5,51.5],[59.5,55],[59.5,60],[59.5,64],
       [63,67],[66,69],[60,69],[54,68.5],[44,68.5],[41,66.5],[35,66.5],[33,69.3],[28,71],[24,71],[19,70],[15,68.8],[13,67.5],[12.5,66],[10.5,64.5],
       [5.2,62],[5,60],[5.6,58.7],[7,58],[8,58.2],[10.5,59],[11.5,58],[12.8,56],[14.3,55.5],[16,56.3],[16.7,57.5],[18.5,59.3],[17.3,61],[17.5,62.5],
       [21,64.5],[22.5,65.8],[25.3,65],[24.5,64],[21.5,62.5],[21.5,60.6],[23,60],[26,60.4],[29.5,60.2],[28,59.5],[24,59.4],[23.5,58.3],[24.3,57.2],
       [21.6,57.5],[21,56],[21.3,55.2],[19.5,54.4],[18,54.8],[14.3,53.8],[12,54.2],[11,54],[10.8,55.5],[10.5,57.7],[8.2,56.8],[8.6,55],[8.7,53.9],
       [7,53.5],[5,53],[4,51.8],[3,51.3],[1.6,50.9],[1.5,50.1],[-1,49.4],[-1.6,49.6],[-1.9,48.7],[-4.7,48.4],[-2.4,47.2],[-1.2,46],[-1.4,44.5],
       [-1.8,43.4],[-4.5,43.4],[-8,43.7]],
      [[-5.7,50],[1.4,51.2],[1.7,52.7],[0.2,53.5],[-1.6,55.6],[-2,57.6],[-4,57.7],[-3,58.6],[-5,58.6],[-6.2,56.8],[-5,55],[-3.2,54.8],[-3.2,53.4],
       [-4.6,53.3],[-4.2,52.3],[-5.2,51.7],[-3,51.4]],
      [[-6,52.2],[-6.2,53.9],[-5.5,54.6],[-7.3,55.3],[-8.5,54.4],[-10,54],[-9.5,52.6],[-10.3,51.8],[-8,51.6]],
      [[-22.5,64],[-24,65.5],[-22,66.4],[-16,66.5],[-13.5,65.2],[-15,64.2],[-19,63.4]],
    ],
    AF: [
      [[32.3,31.2],[29,30.9],[25,31.7],[23,32.6],[20.1,32.2],[19.5,30.3],[15.5,31.5],[11,33.2],[11,35.5],[10,37.3],[8,36.9],[3,36.8],[-1,35.7],
       [-5.9,35.8],[-6.5,34.5],[-9.6,30.4],[-12,28.2],[-16,24],[-17.1,21],[-16.5,19.5],[-17.3,14.7],[-16.8,13],[-15,11],[-13.3,9.2],[-10.5,6.3],
       [-7.5,4.3],[-4,5.2],[0,5.6],[2.5,6.3],[4.5,6.2],[6,4.3],[8.5,4.5],[9.8,2.5],[9.3,0],[9,-1],[11.8,-3.8],[13.2,-6],[13.5,-10],[12,-13.5],
       [11.8,-17],[14.5,-22.5],[15.3,-27],[17.3,-29.5],[18.4,-34],[20,-34.8],[22.5,-34],[25.6,-34],[28,-32.8],[30.5,-30.5],[32.5,-28.5],[32.8,-26],
       [35.5,-24],[35.4,-22],[34.7,-20],[36.8,-17.8],[40.6,-15.3],[40.5,-10.5],[39.3,-8],[39.2,-4.7],[41.5,-1.8],[43.5,0.8],[46,2.3],[48.5,5.5],
       [51,10.4],[51.2,11.8],[49,11.3],[45,10.4],[43.3,11.6],[42.7,12.8],[41,14.8],[39.3,15.9],[38.4,18.3],[37.3,21],[35.6,23.9],[34.6,26],
       [33.5,27.6],[32.6,29.9]],
      [[49.3,-12],[50.5,-15.5],[49.8,-17],[48.5,-20.5],[47.2,-24.8],[45.2,-25.5],[43.7,-23.5],[43.3,-21.5],[44.4,-19],[44,-17],[46.2,-15.8],[48,-13.5]],
    ],
    AS: [
      [[66,69],[69,72.8],[73,72],[80,73.5],[87,75],[100,77],[105,77.7],[113,73.7],[120,73],[129,72],[140,72.5],[150,71.5],[160,70],[170,70],
       [180,69],[190,67],[187,65],[180,65],[178,62.5],[172,60],[163,58],[163,56],[160,53],[156.7,51],[156,57],[161,61],[155,59.3],[143,59.3],
       [141,58.6],[137,54],[141,53],[140,48],[135,43.3],[131,42.6],[129.5,41],[129.4,37],[129.3,35.2],[126.5,34.4],[126.5,37.5],[124.5,39.8],
       [121.5,39],[121,40.8],[118,39.2],[117.7,38.5],[119,37],[122.5,37.4],[120.5,36],[119.2,34.5],[121,32],[122,30],[121.5,28],[119.5,25.5],
       [116.5,23],[113.5,22.2],[110,21],[108,21.6],[106.6,20],[106,18.5],[108.8,15],[109.2,12],[107,10.5],[105,8.6],[103,10.6],[101,12.7],
       [100,13.5],[99.2,10],[100.4,7.3],[101,6.9],[102.2,6.2],[103.4,4.5],[103.5,1.4],[101.3,2.8],[100.3,5.6],[98.3,8],[98.5,11],[97.6,16.5],
       [94.3,16],[94,19.5],[92.3,20.7],[91.8,22.4],[90.5,22],[89,21.8],[86.9,21.2],[85,19.5],[82.2,16.5],[80.2,15.2],[80,10.3],[78,8.5],[77.5,8],
       [76.2,10],[74.8,13],[73,17],[72.8,19.5],[72.6,21.4],[70,20.8],[68.5,23.5],[67,24.8],[64,25.3],[61.5,25.2],[57.3,25.7],[56.4,27.1],[54,26.7],
       [51.5,27.9],[50.2,30],[48.5,30],[48,29],[49.5,27],[50.8,24.8],[51.6,24.2],[54,24.2],[56,26],[56.4,24.8],[57.7,23.7],[59.8,22.5],[58.5,20.5],
       [55.5,17.7],[52.2,15.6],[48.6,14],[45,12.8],[43.4,12.7],[42.8,15],[42,17],[40,20],[39,22],[37.2,25],[35.2,28],[34.9,29.5],[34.3,27.8],
       [32.6,29.9],[32.3,31.2],[34.2,31.3],[35,33],[35.9,35.3],[36.1,36.6],[34.5,36.8],[32,36.1],[30.5,36.3],[29,36.6],[27.3,37],[26.4,38.4],
       [26.7,39.5],[26.2,40.1],[29,41.1],[31.2,41.1],[33.5,42],[35.2,42],[37,41.1],[40,41],[41.6,41.6],[40,43.4],[44,43],[47.5,43],[47.2,44.5],
       [49,46.4],[51.8,47],[51.5,50],[55,51],[58.5,51.5],[59.5,55],[59.5,60],[59.5,64],[63,67]],
      [[130.9,34],[132.5,35.4],[135,35.7],[136,36.5],[137,37.2],[139,38],[140,40.5],[140,41.4],[141.5,41.3],[142,39.5],[141,38.2],[140.9,36.9],
       [140.6,35.2],[139.2,35],[137,34.6],[135.2,33.8],[133,34.3]],
      [[129.7,33.3],[131,33.9],[132,33],[131.2,31.3],[130.2,31.2]],
      [[132.5,33.3],[134.7,34.1],[134.2,33.2],[133,32.8]],
      [[140,41.5],[140.2,43.2],[141.6,45.4],[143.5,44.2],[145.5,43.3],[143.3,42],[141,41.8]],
      [[142,46],[143.5,46.5],[143,49],[144.5,49],[143,53],[142.5,54.3],[142,51]],
      [[120.1,23],[121,25.2],[122,25],[121,22]],
      [[79.8,8],[80.2,9.8],[81.9,7.3],[81.1,6.1],[80,6.2]],
      [[120,16.3],[120.6,18.5],[122.2,18.5],[122,16],[124,13.5],[121,13.8]],
      [[122,10.5],[123,11.5],[125,12],[125.5,10.5],[124,9.8]],
      [[122,7],[123.5,8.5],[126,9.3],[126.6,7],[125.4,5.6],[124,6.3]],
      [[109,1.5],[110,-1.5],[111,-3],[114.5,-4],[116.5,-3.5],[117.5,0],[118.5,1],[119,5],[117,7],[116,6.5],[114,4.6],[111,2.5],[109.6,2]],
      [[95.3,5.6],[97.5,5.2],[100,2.2],[104,-1],[106,-3.2],[105.8,-5.8],[104.5,-5.9],[102,-4],[100.5,-1],[98.6,1.7]],
      [[105.2,-6.8],[106,-5.9],[108.3,-6.3],[111,-6.4],[112.6,-6.9],[114.5,-7.8],[114.4,-8.7],[111,-8.2],[108.3,-7.8],[105.4,-6.9]],
      [[119.5,-5.5],[120.5,-5.6],[120.5,-3],[122.5,-4.8],[123,-3.5],[121.5,-1.5],[123.3,-1],[125,1.5],[121,1.3],[120,0.5],[119.3,-1.5]],
    ],
    AU: [
      [[113.5,-22],[114,-26],[115,-30],[115,-33.6],[116.8,-35],[118,-35],[121,-33.8],[124,-33],[126,-32.3],[129,-31.7],[131.3,-31.5],[134,-32.8],
       [135.6,-34.8],[137.7,-33],[138,-35.6],[139.5,-36],[140.5,-38],[143.5,-38.8],[146.4,-39.1],[150,-37.5],[150.1,-35.6],[151.3,-33.7],[153,-31],
       [153.6,-28.4],[153,-25],[150.8,-22.6],[149,-20.5],[146.3,-18.9],[145.4,-15],[143.5,-14],[142.5,-10.7],[141.5,-12.7],[141.6,-16.4],
       [140.4,-17.6],[139,-17],[135.6,-15],[136.7,-12.3],[135,-12],[132.6,-11.5],[131,-12.3],[129.5,-14.9],[126.7,-13.8],[125,-15.5],[122.2,-17.5],
       [121,-19.5],[117,-20.7]],
      [[144.6,-40.7],[148.3,-40.9],[148,-43.2],[146,-43.6]],
      [[131,-1.5],[134,-0.9],[137,-1.5],[141,-2.6],[145.8,-4.8],[147.5,-6.2],[147.5,-8],[150,-10.3],[146,-8.5],[143.5,-9],[141,-9.1],[138,-8.3],
       [138.4,-6.8],[137.8,-5.2],[135,-4.4],[132.8,-4],[132,-2.8]],
      [[172.7,-34.4],[174.3,-35.3],[175.5,-37],[178.5,-37.7],[177,-39.3],[175.2,-41.6],[174.6,-41.3],[175,-39.8],[173.8,-39.2],[174.6,-38],[173,-35.5]],
      [[172.6,-40.5],[174.3,-41.7],[173.2,-43],[171.2,-44.4],[170.7,-45.9],[169,-46.6],[166.5,-46],[166.5,-45.2],[168.4,-44],[170.6,-42.8],[172.1,-41]],
    ],
    AN: [[[-170,-78],[-150,-76],[-130,-74.5],[-110,-74],[-90,-72.8],[-75,-73],[-70,-72],[-66,-67],[-62,-64.5],[-57,-63.3],[-58,-64.5],[-61,-67],
      [-62,-70],[-61,-74],[-50,-77.8],[-36,-77.8],[-28,-75.5],[-15,-72.5],[0,-70.3],[15,-70],[30,-69.5],[40,-69],[55,-67],[70,-68],[75,-69.5],
      [85,-66.5],[100,-66],[115,-66.8],[130,-66.2],[145,-67],[160,-70],[168,-72],[172,-77],[190,-78],[190,-82],[-170,-82]]],
  };
  const LAKES = [[[47.5,43],[49.5,40.5],[49,38],[51,36.8],[54,37.3],[53.8,40.5],[52.8,41.5],[53,45],[51.5,46.8],[49,46.4],[47.2,44.5]]]; // Caspian Sea

  // Oceans: drawn under the land, so their edges only need to be right in the water.
  const AMERICAS_N = [[-100,66],[-100,30],[-100,20],[-96,17],[-91,15.5],[-85.5,12.5],[-80.5,8.5],[-76,6],[-78,0]];
  const AMERICAS_S = [[-78,0],[-69,-20],[-71,-40],[-70,-52],[-67,-56]];
  const INDIAN_E = [[98,15],[98.6,8],[95.3,5.6],[102,0],[104,-2],[106,-6],[115,-8.5],[125,-9],[132,-15],[140,-25],[147,-40],[147,-56]];
  const SEA = {
    AR: [[[-170,TOP + 2],[190,TOP + 2],[190,66],[-170,66]]],
    SO: [[[-170,-56],[190,-56],[190,-82],[-170,-82]]],
    NP: [[[-170,66],...AMERICAS_N,[-170,0]], [[98,66],[190,66],[190,0],[102,0],[95.3,5.6],[98.6,8],[98,15]]],
    SP: [[[-170,0],...AMERICAS_S,[-170,-56]], [[102,0],[190,0],[190,-56],...[...INDIAN_E].reverse().slice(0, -3)]],
    NAt: [[...AMERICAS_N.slice().reverse(),[30,66],[30,30],[10,0]]],
    SAt: [[...AMERICAS_S,[20,-56],[20,-35],[20,-20],[10,0]]],
    IN: [[[30,30],[60,30],[90,30],...INDIAN_E,[20,-56],[20,-35],[20,-20],[30,0]]],
  };

  const PLACES = [
    { id: "NA", name: "North America", kind: "land", label: ["NORTH", "AMERICA"], at: [-103, 50] },
    { id: "SA", name: "South America", kind: "land", label: ["SOUTH", "AMERICA"], at: [-59, -13] },
    { id: "EU", name: "Europe", kind: "land", label: ["EUROPE"], at: [24, 54] },
    { id: "AF", name: "Africa", kind: "land", label: ["AFRICA"], at: [20, 9] },
    { id: "AS", name: "Asia", kind: "land", label: ["ASIA"], at: [96, 52] },
    { id: "AU", name: "Australia", kind: "land", label: ["AUSTRALIA"], at: [133, -24.5] },
    { id: "AN", name: "Antarctica", kind: "land", label: ["ANTARCTICA"], at: [40, -75.5] },
    { id: "NP", name: "North Pacific Ocean", kind: "sea", label: ["NORTH", "PACIFIC"], at: [-140, 30], more: [[176, 28]] },
    { id: "SP", name: "South Pacific Ocean", kind: "sea", label: ["SOUTH", "PACIFIC"], at: [-122, -26], more: [[177, -21]] },
    { id: "NAt", name: "North Atlantic Ocean", kind: "sea", label: ["NORTH", "ATLANTIC"], at: [-41, 31] },
    { id: "SAt", name: "South Atlantic Ocean", kind: "sea", label: ["SOUTH", "ATLANTIC"], at: [-14, -22] },
    { id: "IN", name: "Indian Ocean", kind: "sea", label: ["INDIAN"], at: [77, -20] },
    { id: "AR", name: "Arctic Ocean", kind: "sea", label: ["ARCTIC"], at: [16, 81] },
    { id: "SO", name: "Southern Ocean", kind: "sea", label: ["SOUTHERN"], at: [-105, -62.5] },
  ];
  const BY_ID = Object.fromEntries(PLACES.map((p) => [p.id, p]));
  const SHAPES = { ...LAND, ...SEA };

  /* --- the lists (the manual prints the same ones) --- */
  const PLANES = { red: "#e23b3b", blue: "#2f6fe0", green: "#2fa34a", yellow: "#f5d330", orange: "#f08a1c", purple: "#8e44c9", pink: "#ff7ad9", white: "#ffffff" };
  const STOPS = 4;
  const seeded = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  // One list per plane color: 4 different places, at least one continent and one ocean, every list starts
  // somewhere different, and all 14 places come up somewhere. Same CYCLE + version = same lists.
  const makeLists = (version) => {
    const r = seeded(MANUAL.hash(MANUAL.CYCLE + "|worldTour|" + version) % 2147483647), ids = PLACES.map((p) => p.id), colors = Object.keys(PLANES);
    const draw = () => { const a = [...ids]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, STOPS); };
    const okList = (l) => l.some((id) => BY_ID[id].kind === "land") && l.some((id) => BY_ID[id].kind === "sea");
    for (;;) {
      const lists = colors.map(() => { let l; do l = draw(); while (!okList(l)); return l; });
      if (new Set(lists.map((l) => l[0])).size === colors.length && new Set(lists.flat()).size === ids.length)
        return Object.fromEntries(colors.map((c, i) => [c, lists[i]]));
    }
  };
  const LISTS = { names: makeLists("names"), blank: makeLists("blank") };

  const chime = (ok) => { try { if (window.SFX && window.SFX.isMuted()) return; const a = new (window.AudioContext || window.webkitAudioContext)();
    (ok ? [660, 990] : [180]).forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = f; o.type = ok ? "sine" : "square";
      o.connect(g); g.connect(a.destination); g.gain.value = 0.06; o.start(a.currentTime + i * 0.1); o.stop(a.currentTime + i * 0.1 + 0.18); }); } catch (e) {} };

  const PLANE_PATH = "M12 1.5c.9 0 1.5.9 1.5 2.2V9l8.5 5v2.2l-8.5-2.6v5.3l2.6 2v1.8L12 21.6l-4.1 1.1v-1.8l2.6-2v-5.3L2 16.2V14l8.5-5V3.7c0-1.3.6-2.2 1.5-2.2z";
  const Plane = ({ color, size = 40, angle = 0, x, y, s = 1 }) => x == null
    ? <svg viewBox="0 0 24 24" width={size} height={size}><path d={PLANE_PATH} fill={PLANES[color]} stroke="#1b1424" strokeWidth="1.1" strokeLinejoin="round" /></svg>
    : <g className="wt-plane" transform={`translate(${x},${y}) rotate(${angle}) scale(${s}) translate(-6,-6) scale(0.5)`}><path d={PLANE_PATH} fill={PLANES[color]} stroke="#1b1424" strokeWidth="1.6" strokeLinejoin="round" /></g>;

  /* The map. `names`: write the names on it. `onPick(id, point)`: makes every place a button.
     `mark`: { id, ok } flashes a place. `route`: the pins so far, [{ x, y }]. */
  /* Zoom: the map is vectors (SVG), so it stays sharp at any size. Zooming only changes the viewBox.
     Two fingers: pinch / spread. One finger on a zoomed map: drag it. A drag never counts as a tap.
     Buttons + − ⟲ for a mouse; a trackpad pinch (ctrl + wheel) works too. Names and pins shrink a little
     as you zoom in (by the square root), so they get bigger on screen but don't cover the map. */
  const MAX_ZOOM = 5;
  const clampView = ({ x, y, w }) => { w = Math.min(W, Math.max(W / MAX_ZOOM, w)); const h = (w * H) / W;
    return { x: Math.min(W - w, Math.max(0, x)), y: Math.min(H - h, Math.max(0, y)), w }; };
  const FULL = { x: 0, y: 0, w: W };

  const WorldMap = ({ names = true, onPick, mark, route = [], plane, zoomable = true }) => {
    const svg = useRef(null);
    const [view, setView] = useState(FULL);
    const viewRef = useRef(view); viewRef.current = view;
    const pts = useRef(new Map()), gest = useRef(null), dragged = useRef(false);
    const zoom = W / view.w, k = Math.sqrt(zoom);
    // keep the map point under (cx, cy) on screen still while the width becomes w
    const zoomAt = (v, w, cx, cy) => { const r = svg.current.getBoundingClientRect(), fx = (cx - r.left) / r.width, fy = (cy - r.top) / r.height;
      const px = v.x + fx * v.w, py = v.y + (fy * v.w * H) / W; return clampView({ x: px - fx * w, y: py - (fy * w * H) / W, w }); };
    const zoomBy = (f) => { const r = svg.current.getBoundingClientRect(); setView((v) => zoomAt(v, v.w / f, r.left + r.width / 2, r.top + r.height / 2)); };
    const down = (e) => {
      if (!zoomable) return;
      pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.current.size === 1) { dragged.current = false; gest.current = { x: e.clientX, y: e.clientY, v: viewRef.current }; }
      else if (pts.current.size === 2) { const [a, b] = [...pts.current.values()]; dragged.current = true;
        gest.current = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, v: viewRef.current, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; }
    };
    useEffect(() => {
      if (!zoomable) return;
      const move = (e) => {
        if (!pts.current.has(e.pointerId) || !gest.current) return;
        pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const g = gest.current, r = svg.current.getBoundingClientRect();
        if (pts.current.size >= 2 && g.d) { const [a, b] = [...pts.current.values()], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
          const z = zoomAt(g.v, g.v.w * (g.d / (Math.hypot(a.x - b.x, a.y - b.y) || 1)), g.mx, g.my); // zoom round the first middle…
          setView(clampView({ ...z, x: z.x - ((mx - g.mx) / r.width) * z.w, y: z.y - ((my - g.my) / r.width) * z.w })); // …then follow the fingers
        } else if (pts.current.size === 1 && g.v && !g.d) {
          const dx = e.clientX - g.x, dy = e.clientY - g.y;
          if (!dragged.current && Math.hypot(dx, dy) < 8) return;
          if (g.v.w >= W) return; // not zoomed: nothing to drag (and the page can scroll)
          dragged.current = true; setView(clampView({ ...g.v, x: g.v.x - (dx / r.width) * g.v.w, y: g.v.y - (dy / r.width) * g.v.w }));
        }
      };
      const up = (e) => { if (!pts.current.delete(e.pointerId)) return;
        if (pts.current.size === 1) { const [p] = [...pts.current.values()]; gest.current = { x: p.x, y: p.y, v: viewRef.current }; } // pinch -> drag
        else if (!pts.current.size) gest.current = null; };
      const wheel = (e) => { if (!e.ctrlKey) return; e.preventDefault(); const v = viewRef.current; setView(zoomAt(v, v.w * Math.exp(e.deltaY * 0.01), e.clientX, e.clientY)); };
      const el = svg.current;
      window.addEventListener("pointermove", move); window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
      el.addEventListener("wheel", wheel, { passive: false });
      return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); el.removeEventListener("wheel", wheel); };
    }, [zoomable]);
    const noTapAfterDrag = (e) => { if (dragged.current) { e.stopPropagation(); e.preventDefault(); dragged.current = false; } };
    const pick = (id) => (e) => {
      if (!onPick) return;
      let pt = null;
      if (e.clientX || e.clientY) { const m = svg.current.getScreenCTM(); if (m) { const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()); pt = { x: p.x, y: p.y }; } }
      onPick(id, pt);
    };
    const cls = (id) => `wt-${BY_ID[id].kind}${onPick ? " wt-btn" : ""}${mark && mark.id === id ? (mark.ok ? " wt-ok" : " wt-bad") : ""}${route.some((r) => r.id === id) ? " wt-done" : ""}`;
    const label = (p, [lon, lat], small) => {
      const size = (p.kind === "land" ? (small ? 8 : 11) : (small ? 7 : 9.5)) / k, lh = size * 1.05, y0 = Y(lat) - ((p.label.length - 1) * lh) / 2 + size * 0.35;
      return (<text key={`${p.id}${lon}`} className={`wt-name wt-name-${p.kind}`} x={X(lon)} y={y0} fontSize={size} textAnchor="middle" onClick={pick(p.id)} data-place={p.id}>
        {p.label.map((w, i) => <tspan key={i} x={X(lon)} y={y0 + i * lh}>{w}</tspan>)}</text>);
    };
    const shapes = (kind) => PLACES.filter((p) => p.kind === kind).map((p) => (
      <g key={p.id} className={cls(p.id)} data-place={p.id} onClick={pick(p.id)}>{SHAPES[p.id].map((s, i) => <path key={i} d={path(s)} />)}</g>));
    const last = route[route.length - 1], prev = route[route.length - 2];
    const map = (<svg ref={svg} className={`wt-map${zoomable && zoom > 1.01 ? " wt-zoomed" : ""}`} viewBox={`${view.x} ${view.y} ${view.w} ${(view.w * H) / W}`}
      role="img" aria-label="world map" onPointerDown={down} onClickCapture={noTapAfterDrag}>
      <rect width={W} height={H} className="wt-water" />
      {shapes("sea")}
      {shapes("land")}
      {LAKES.map((s, i) => <path key={i} d={path(s)} className="wt-lake" />)}
      {names && PLACES.map((p) => [label(p, p.at, false), ...(p.more || []).map((a) => label(p, a, true))])}
      {route.length > 1 && <polyline className="wt-route" points={route.map((r) => `${r.x},${r.y}`).join(" ")} />}
      {route.map((r, i) => <g key={i} className="wt-pin"><circle cx={r.x} cy={r.y} r={5 / k} strokeWidth={1 / k} /><text x={r.x} y={r.y + 2.4 / k} textAnchor="middle" fontSize={6.5 / k}>{i + 1}</text></g>)}
      {plane && last && <Plane color={plane} x={last.x + 7 / k} y={last.y - 7 / k} s={1 / k} angle={prev ? (Math.atan2(last.y - prev.y, last.x - prev.x) * 180) / Math.PI + 90 : 45} />}
    </svg>);
    if (!zoomable) return map;
    return (<div className="wt-zoombox">{map}
      <div className="wt-zoom"><span>{zoom > 1.01 ? "Drag to move" : "Pinch to zoom"}</span>
        <button type="button" onClick={() => zoomBy(1.6)} disabled={zoom >= MAX_ZOOM - 0.01} aria-label="zoom in">+</button>
        <button type="button" onClick={() => zoomBy(1 / 1.6)} disabled={zoom <= 1.01} aria-label="zoom out">−</button>
        <button type="button" onClick={() => setView(FULL)} disabled={zoom <= 1.01} aria-label="whole map">⟲</button>
      </div></div>);
  };

  /* --- Defuser --- */
  const makeModule = (version) => ({ onSuccess, onStrike }) => {
    const [plane] = useState(() => { const c = Object.keys(PLANES); return c[Math.floor(Math.random() * c.length)]; });
    const list = LISTS[version][plane];
    const [route, setRoute] = useState([]);           // the right places so far: [{ id, x, y }]
    const [mark, setMark] = useState(null);
    const [phase, setPhase] = useState("play");       // play | shake | won
    const timer = useRef(null);
    useEffect(() => () => clearTimeout(timer.current), []);
    Object.assign(TEST, { plane, list, route, phase, version });
    const onPick = (id, pt) => {
      if (phase !== "play") return;
      const at = pt || { x: X(BY_ID[id].at[0]), y: Y(BY_ID[id].at[1]) + (BY_ID[id].label.length * 5) };
      clearTimeout(timer.current);
      if (id === list[route.length]) {
        chime(true); const next = [...route, { id, ...at }]; setRoute(next); setMark({ id, ok: true });
        if (next.length === list.length) { setPhase("won"); onSuccess(); return; }
        timer.current = setTimeout(() => setMark(null), 500);
      } else {
        chime(false); onStrike(); setMark({ id, ok: false }); setPhase("shake");
        timer.current = setTimeout(() => { setRoute([]); setMark(null); setPhase("play"); }, 900);
      }
    };
    return (<div className="module-content wt"><h3>✈️ WORLD TOUR{version === "blank" ? ": BLANK MAP" : ""}</h3>
      <div className="wt-top">
        <div className="wt-ticket"><Plane color={plane} size={38} /></div>
        <div className="wt-lamps">{list.map((_, i) => <span key={i} className={i < route.length ? "on" : i === route.length && phase === "play" ? "now" : ""}>{i + 1}</span>)}</div>
      </div>
      <div className={`wt-frame ${phase === "shake" ? "wt-shake" : ""}`}>
        <WorldMap names={version === "names"} onPick={onPick} mark={mark} route={route} plane={plane} />
        {phase === "shake" && <div className="wt-flash">✖ START AGAIN</div>}
        {phase === "won" && <div className="wt-flash wt-good">✔ HOME!</div>}
      </div>
    </div>);
  };

  /* --- Expert --- */
  const ListTable = ({ version }) => (<table className="manual-table wt-lists"><thead><tr><th>Plane</th>{Array.from({ length: STOPS }, (_, i) => <th key={i}>{i + 1}</th>)}</tr></thead>
    <tbody>{Object.keys(PLANES).map((c) => <tr key={c}><td style={{ textAlign: "left", whiteSpace: "nowrap" }}><span className="wt-sw" style={{ background: PLANES[c] }} />{c}</td>
      {LISTS[version][c].map((id, i) => <td key={i}>{BY_ID[id].name.replace(" Ocean", "")}{BY_ID[id].kind === "sea" && <><br /><small>Ocean</small></>}</td>)}</tr>)}</tbody></table>);
  const MANUALS = {
    names: () => (<div className="wt-manual">
      <p>The Defuser has a <strong>map of the world</strong> and a <strong>plane</strong>.</p>
      <p><strong>Ask:</strong> "What color is the plane?" Find the plane in the list. Read the four places, one by one.
        The Defuser touches them on the map, in order: 1, 2, 3, 4.</p>
      <ListTable version="names" />
      <p><strong>Wrong place: STRIKE!</strong> Start again from place 1.</p>
      <p className="wt-eg">"The plane is green." "OK. Number one: Africa. Number two: the Indian Ocean…"</p>
    </div>),
    blank: () => (<div className="wt-manual">
      <p>The Defuser has a <strong>map of the world</strong> and a <strong>plane</strong>. The Defuser's map has <strong>no names</strong>!</p>
      <p><strong>Ask:</strong> "What color is the plane?" Find the plane in the list. Tell the Defuser the four places, in order: 1, 2, 3, 4.
        Use your map. Help them find each place.</p>
      <ListTable version="blank" />
      <WorldMap names zoomable={!React.useContext(MANUAL.Print)} />
      <div className="wt-words">
        <p><strong>Say where it is:</strong></p>
        <p>It's <strong>next to</strong> Africa. · It's <strong>between</strong> Asia and Australia.</p>
        <p>It's <strong>above</strong> / <strong>north of</strong> Europe. · It's <strong>under</strong> / <strong>south of</strong> Asia.</p>
        <p>It's <strong>on the left</strong> / <strong>west</strong>. · It's <strong>on the right</strong> / <strong>east</strong>.</p>
        <p>It's at the <strong>top</strong>. · It's at the <strong>bottom</strong>. · It's very <strong>big</strong> / <strong>small</strong>.</p>
      </div>
      <p><strong>Wrong place: STRIKE!</strong> Start again from place 1.</p>
    </div>),
  };

  const css = document.createElement("style");
  css.textContent = `
    .wt-top{display:flex;align-items:center;gap:10px;margin-bottom:6px;}
    .wt-ticket{background:#0a1520;border:2px solid #444;border-radius:8px;padding:4px 8px;display:flex;}
    .wt-lamps{display:flex;gap:8px;}
    .wt-lamps span{width:26px;height:26px;border-radius:50%;background:#222;border:2px solid #555;color:#888;display:flex;align-items:center;justify-content:center;font-family:'Orbitron',sans-serif;font-size:0.75rem;}
    .wt-lamps span.now{border-color:#ffcc00;color:#ffcc00;} .wt-lamps span.on{background:#3bff6a;border-color:#3bff6a;color:#0a1520;box-shadow:0 0 10px #3bff6a;}
    .wt-frame{position:relative;border:3px solid #333;border-radius:8px;overflow:hidden;background:#1f5f8f;}
    .wt-frame.wt-shake{animation:wt-shake 0.4s;}
    @keyframes wt-shake{0%,100%{transform:translateX(0);}20%,60%{transform:translateX(-6px);}40%,80%{transform:translateX(6px);}}
    .wt-map{display:block;width:100%;height:auto;touch-action:pan-y;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;}
    .wt-water{fill:#1f5f8f;}
    .wt-map.wt-zoomed{touch-action:none;cursor:grab;}
    .wt-map path,.wt-map polyline{vector-effect:non-scaling-stroke;}
    .wt-sea path{fill:#2a6fa3;stroke:#8cc3ea;stroke-width:0.6px;stroke-dasharray:2 2;stroke-opacity:0.6;}
    .wt-land path{fill:#d9c78f;stroke:#5b4a2a;stroke-width:0.7px;stroke-linejoin:round;}
    .wt-lake{fill:#2a6fa3;stroke:#5b4a2a;stroke-width:0.6px;pointer-events:none;}
    .wt-btn{cursor:pointer;}
    @media (hover:hover){ .wt-sea.wt-btn:hover path{fill:#3d86bd;} .wt-land.wt-btn:hover path{fill:#eedd9f;} }
    .wt-sea.wt-done path{fill:#357db2;} .wt-land.wt-done path{fill:#e8d9a4;}
    .wt-ok path{fill:#3bbf5f !important;} .wt-bad path{fill:#e04848 !important;}
    .wt-name{font-family:'Arial Narrow','Roboto Condensed',Arial,Helvetica,sans-serif;font-weight:900;paint-order:stroke;stroke-width:2.2px;stroke-linejoin:round;cursor:pointer;}
    .wt-name-land{fill:#3a2a10;stroke:#f3e7bd;letter-spacing:0.3px;}
    .wt-name-sea{fill:#e6f4ff;stroke:#174a70;font-style:italic;font-weight:700;letter-spacing:0.3px;}
    .wt-route{fill:none;stroke:#ffcc00;stroke-width:1.6px;stroke-dasharray:4 3;pointer-events:none;}
    .wt-pin,.wt-plane{pointer-events:none;} .wt-pin circle{fill:#ffcc00;stroke:#1b1424;stroke-width:1;} .wt-pin text{font-family:'Orbitron',sans-serif;font-weight:900;fill:#1b1424;}
    .wt-flash{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(160,20,20,0.55);color:#fff;font-family:'Orbitron',sans-serif;font-size:1.3rem;font-weight:900;pointer-events:none;}
    .wt-flash.wt-good{background:rgba(20,140,60,0.45);}
    .wt-manual .wt-zoombox,.wt-manual > .wt-map{border:1px solid #888;border-radius:4px;margin:8px 0;overflow:hidden;}
    .wt-manual .wt-zoom{background:#e8e0cc;border-top:1px solid #888;} .wt-manual .wt-zoom span{color:#555;}
    .wt-zoom{display:flex;justify-content:flex-end;align-items:center;gap:6px;padding:4px;background:#0a1520;border-top:2px solid #333;}
    .wt-zoom span{flex:1;font-size:0.7rem;color:#8aa;font-family:sans-serif;}
    .wt-zoom button{width:34px;height:34px;border-radius:6px;border:2px solid #1b1424;background:rgba(255,255,255,0.85);color:#1b1424;font-size:1.15rem;font-weight:900;line-height:1;cursor:pointer;padding:0;}
    .wt-zoom button:disabled{opacity:0.35;cursor:default;}
    .wt-manual .wt-name{cursor:default;}
    .wt-lists td{vertical-align:middle;line-height:1.2;} .wt-lists small{opacity:0.7;}
    .wt-sw{display:inline-block;width:14px;height:14px;border:1px solid #555;border-radius:3px;margin-right:6px;vertical-align:-2px;}
    .wt-words{border:1px dashed #998;border-radius:6px;padding:4px 10px;margin:8px 0;} .wt-words p{margin:3px 0;}
    .wt-eg{font-size:0.9rem;opacity:0.85;font-style:italic;}
  `;
  document.head.appendChild(css);

  const _test = Object.assign(TEST, { LISTS, PLACES, PLANES, BY_ID, SHAPES, STOPS, makeLists, X, Y });
  (window.EXTRA_MODULES = window.EXTRA_MODULES || []).push(
    { id: "worldTour", name: "✈️ World Tour", type: "worldTour", difficulty: "A1", puzzle: 1, Component: makeModule("names"), Manual: MANUALS.names, _test },
    { id: "worldTourBlank", name: "✈️ World Tour: Blank Map", type: "worldTourBlank", difficulty: "A2", puzzle: 2, Component: makeModule("blank"), Manual: MANUALS.blank, _test },
  );
})();
