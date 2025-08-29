// world.js — 3D Sphere World using Canvas 2D + pseudo-3D
// We avoid frameworks. We'll use simple math to render a rotating sphere with nodes and a stickman moving on great-circle arcs.

(function(){
  const canvas = document.getElementById('world');
  const ctx = canvas.getContext('2d');

  // Center image to draw inside the sphere (defaults to our neon SVG)
  const centerImage = new Image();
  const defaultCenterImage = (canvas && canvas.dataset && canvas.dataset.centerImage) || 'assets/planet-python-logo.svg';
  centerImage.src = defaultCenterImage;
  centerImage.decoding = 'async';
  let centerImageLoaded = false;
  centerImage.addEventListener('load', ()=>{ centerImageLoaded = true; });

  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Camera
  let camYaw = 0; // around Y
  let camPitch = 0.2; // up/down
  let camDist = 3.0; // from origin in sphere radii
  // Mouse interaction state
  let isDragging = false;
  let lastX = 0, lastY = 0;
  let dragAccum = 0;

  // Sphere radius
  const R = 220;

  // Utility math
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp = (a,b,t)=>a+(b-a)*t;
  const ease = t=>t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; // cubic ease in/out
  const rand = (a,b)=>a+Math.random()*(b-a);
  const wrapPi = (a)=>{ while(a<=-Math.PI) a+=Math.PI*2; while(a>Math.PI) a-=Math.PI*2; return a; };

  // Route-based randomized node placement (winding path around sphere)
  function makeRandomRouteNodes(){
    const out = [];
    // start near front equator
    let lat = rand(-0.2, 0.2);
    let lon = 0; // facing camera initially
    window.STAGES.forEach((s, i)=>{
      if(i===0){
        out.push({ id: s.id, title: s.title, lat, lon, unlocked: true, completed: false });
      } else {
        // perform a random walk with constrained steps to keep a smooth roadmap
        lat = clamp(lat + rand(-0.35, 0.35), -1.0, 1.0);
        lon = wrapPi(lon + rand(0.6, 1.2) + rand(-0.2,0.2));
        out.push({ id: s.id, title: s.title, lat, lon, unlocked: false, completed: false });
      }
    });
    return out;
  }

  // Nodes and edges
  const nodes = makeRandomRouteNodes();
  // Maintain adjacency (linear path)
  const edges = nodes.slice(0,-1).map((n, i) => ({ a: n.id, b: nodes[i+1].id }));

  // Stickman position on sphere in spherical coords
  let stickLat = nodes[0].lat;
  let stickLon = nodes[0].lon;
  let targetLat = stickLat;
  let targetLon = stickLon;
  let moving = false;
  let moveT = 0; // 0..1
  let moveSpeed = 0.4; // per second
  let currentNodeId = nodes[0].id;

  // Progress
  const progress = {
    unlocked: new Set([1]),
    completed: new Set(),
    xp: 0,
    coins: 0,
  };

  // Convert spherical to 3D
  function sphTo3D(lat, lon, r){
    const x = r * Math.cos(lat) * Math.cos(lon);
    const y = r * Math.sin(lat);
    const z = r * Math.cos(lat) * Math.sin(lon);
    return {x,y,z};
  }

  // Camera transform and projection
  function project(p){
    // camera at spherical coords; build camera basis
    const cy = Math.cos(camYaw), sy = Math.sin(camYaw);
    const cp = Math.cos(camPitch), sp = Math.sin(camPitch);

    // rotate around Y (yaw)
    let x = p.x * cy - p.z * sy;
    let z = p.x * sy + p.z * cy;
    // rotate around X (pitch)
    let y = p.y * cp - z * sp;
    z = p.y * sp + z * cp;

    // translate by camera distance along Z
    const cz = camDist * R;
    z += cz;

    const f = (canvas.height*0.8) / (z || 1e-3);
    const sx = canvas.width/2 + x * f;
    const sy2 = canvas.height/2 - y * f;
    const depth = z;
    return {x:sx, y:sy2, depth};
  }

  function drawGrid(){
    // draw a neon grid sphere: longitudes and latitudes
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,255,153,0.22)';
    const stepsLat = 10, stepsLon = 16;
    for(let i=1;i<stepsLat;i++){
      const lat = -Math.PI/2 + (i*Math.PI/stepsLat);
      const pts = [];
      for(let j=0;j<=stepsLon;j++){
        const lon = j/stepsLon * Math.PI*2;
        const p = sphTo3D(lat, lon, R);
        pts.push(project(p));
      }
      drawPath(pts);
    }
    for(let j=0;j<stepsLon;j++){
      const lon = j/stepsLon * Math.PI*2;
      const pts = [];
      for(let i=0;i<=stepsLat;i++){
        const lat = -Math.PI/2 + (i*Math.PI/stepsLat);
        const p = sphTo3D(lat, lon, R);
        pts.push(project(p));
      }
      drawPath(pts);
    }
    ctx.restore();
  }

  // Draw provided image clipped inside the projected sphere circle
  function drawCenterImage(){
    if(!centerImageLoaded) return;
    const c = project({x:0,y:0,z:0});
    const cz = camDist * R;
    const f = (canvas.height * 0.8) / (cz || 1e-3);
    const rpix = R * f; // sphere radius in pixels
    const diameter = rpix * 2 * 0.9; // leave margin inside the sphere
    const w = diameter; const h = diameter;
    ctx.save();
    ctx.beginPath();
    ctx.arc(c.x, c.y, rpix * 0.92, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalAlpha = 0.42;
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(centerImage, c.x - w/2, c.y - h/2, w, h);
    const grad = ctx.createRadialGradient(c.x, c.y, rpix*0.2, c.x, c.y, rpix*0.92);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(c.x, c.y, rpix*0.92, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function drawPath(pts){
    ctx.beginPath();
    for(let i=0;i<pts.length;i++){
      const p = pts[i];
      if(i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y);
    }
    ctx.stroke();
  }

  // Great-circle arc between two spherical points, returned as projected screen points
  function arcPoints(aLat,aLon,bLat,bLon, segs=48){
    // to 3D unit vectors
    const A = sphTo3D(aLat,aLon,1);
    const B = sphTo3D(bLat,bLon,1);
    const dot = Math.max(-1, Math.min(1, A.x*B.x + A.y*B.y + A.z*B.z));
    const omega = Math.acos(dot);
    const so = Math.sin(omega) || 1e-6;
    const pts = [];
    for(let i=0;i<=segs;i++){
      const t = i/segs;
      const s1 = Math.sin((1-t)*omega)/so;
      const s2 = Math.sin(t*omega)/so;
      const x = s1*A.x + s2*B.x;
      const y = s1*A.y + s2*B.y;
      const z = s1*A.z + s2*B.z;
      const p = project({x:x*R, y:y*R, z:z*R});
      pts.push(p);
    }
    return pts;
  }

  function drawEdges(){
    edges.forEach(e=>{
      const a = nodes.find(n=>n.id===e.a);
      const b = nodes.find(n=>n.id===e.b);
      const pts = arcPoints(a.lat,a.lon,b.lat,b.lon, 56);
      // gradient along segment start->end
      const pa = pts[0], pb = pts[pts.length-1];
      const grd = ctx.createLinearGradient(pa.x,pa.y,pb.x,pb.y);
      grd.addColorStop(0,'rgba(0,231,255,0.35)');
      grd.addColorStop(1,'rgba(0,255,153,0.75)');
      ctx.strokeStyle = grd;
      ctx.lineWidth = 2.5;
      drawPath(pts);
      // Directional arrow near 70%
      const k = Math.max(2, Math.floor(pts.length*0.7));
      const p1 = pts[k-1];
      const p2 = pts[k];
      const vx = p2.x - p1.x, vy = p2.y - p1.y;
      const len = Math.hypot(vx,vy) || 1;
      const ux = vx/len, uy = vy/len;
      const size = 10;
      ctx.save();
      ctx.fillStyle = 'rgba(0,255,153,0.85)';
      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(p2.x - ux*size - uy*size*0.6, p2.y - uy*size + ux*size*0.6);
      ctx.lineTo(p2.x - ux*size + uy*size*0.6, p2.y - uy*size - ux*size*0.6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  function drawNodes(){
    nodes.forEach(n=>{
      const p3 = sphTo3D(n.lat,n.lon,R+1);
      const p = project(p3);
      const size = 8 + (n.unlocked?4:0) + (n.completed?2:0);
      const glow = n.unlocked ? '0,255,153' : '0,231,255';
      ctx.save();
      ctx.fillStyle = `rgba(${glow},0.9)`;
      ctx.shadowColor = `rgba(${glow},1)`;
      ctx.shadowBlur = n.unlocked?20:10;
      ctx.beginPath();
      ctx.arc(p.x,p.y,size,0,Math.PI*2);
      ctx.fill();
      ctx.restore();

      // label
      ctx.save();
      ctx.fillStyle = 'rgba(170,255,238,0.9)';
      ctx.font = '12px Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${n.id}. ${n.title}`, p.x, p.y - size - 10);
      ctx.restore();
    });
  }

  function drawStickman(){
    const p = project(sphTo3D(stickLat, stickLon, R+6));
    const base = {x:p.x, y:p.y};
    const t = performance.now()/400;
    // simple walking animation when moving
    const step = moving ? Math.sin(t)*3 : 0;

    ctx.save();
    ctx.strokeStyle = 'rgba(0,255,153,0.9)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    // body
    line(base.x, base.y-30, base.x, base.y-10);
    // head
    circle(base.x, base.y-38, 7);
    // arms
    line(base.x, base.y-25, base.x-12, base.y-18+step);
    line(base.x, base.y-25, base.x+12, base.y-18-step);
    // legs
    line(base.x, base.y-10, base.x-8, base.y+6-step);
    line(base.x, base.y-10, base.x+8, base.y+6+step);
    ctx.restore();
  }

  function line(x1,y1,x2,y2){
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  }
  function circle(x,y,r){
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.stroke();
  }

  // Interaction: clicking nodes to move
  canvas.addEventListener('click', (ev)=>{
    // ignore clicks that are actually drags
    if(dragAccum > 6) return;
    const x = ev.clientX, y = ev.clientY;
    // pick nearest node by screen distance if within threshold
    let best=null, bestD=18;
    nodes.forEach(n=>{
      // allow clicking all nodes (locked or unlocked)
      const p = project(sphTo3D(n.lat,n.lon,R+1));
      const d = Math.hypot(p.x-x,p.y-y);
      if(d<bestD){ best = n; bestD = d; }
    });
    if(best){
      // Open the stage panel directly on click
      const st = window.STAGES.find(s=>s.id===best.id);
      if(st) window.UI.openPanel(st, progress);
    }
  });

  // Mouse drag to rotate camera
  canvas.style.cursor = 'grab';
  canvas.addEventListener('mousedown', (e)=>{
    isDragging = true; lastX = e.clientX; lastY = e.clientY; dragAccum = 0; canvas.style.cursor = 'grabbing';
    // stop camera tween if any
    camTween = null;
  });
  window.addEventListener('mousemove', (e)=>{
    if(!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    dragAccum += Math.abs(dx) + Math.abs(dy);
    camYaw = wrapPi(camYaw + dx * 0.005);
    camPitch = clamp(camPitch + dy * 0.003, -1.2, 1.2);
  });
  window.addEventListener('mouseup', ()=>{ if(isDragging){ isDragging=false; canvas.style.cursor = 'grab'; }});
  // Wheel to zoom in/out
  canvas.addEventListener('wheel', (e)=>{
    e.preventDefault();
    camDist = clamp(camDist + (e.deltaY>0? 0.2 : -0.2), 1.6, 6.0);
  }, {passive:false});

  function goToNode(n){
    if(moving) return;
    targetLat = n.lat; targetLon = n.lon; moveT = 0; moving = true; currentNodeId = n.id;
    // camera will gently yaw toward the target lon
    camYaw = wrapPi(camYaw);
    const targetYaw = wrapPi(n.lon + Math.PI/2);
    cameraTweenToYaw(targetYaw);
  }

  function normalizeAngle(a){
    while(a<-Math.PI) a+=Math.PI*2; while(a>Math.PI) a-=Math.PI*2; return a;
  }

  // simple camera yaw tweening
  let camTween = null;
  function cameraTweenToYaw(target){
    camTween = {from: camYaw, to: target, t: 0, dur: 1.2};
  }

  // open panel on key or on arrival
  function openCurrentStage(){
    const st = window.STAGES.find(s=>s.id===currentNodeId);
    if(st) window.UI.openPanel(st, progress);
  }

  window.addEventListener('keydown', (e)=>{
    if(e.key==='Enter') openCurrentStage();
  });

  // Update loop
  let prev = performance.now();
  function tick(){
    const now = performance.now();
    const dt = (now - prev)/1000; prev = now;

    // animate camera tween
    if(camTween){
      camTween.t += dt;
      const tt = clamp(camTween.t/camTween.dur,0,1);
      const ee = ease(tt);
      camYaw = lerp(camTween.from, camTween.to, ee);
      if(tt>=1) camTween = null;
    }

    // move stickman along spherical lerp (approx)
    if(moving){
      moveT += dt*moveSpeed;
      const t = clamp(moveT,0,1);
      // slerp not exact; use linear in lat/lon for simplicity
      stickLat = lerp(stickLat, targetLat, ease(t));
      stickLon = lerp(stickLon, targetLon, ease(t));
      if(t>=1){ moving=false; openCurrentStage(); }
    }

    // draw
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // drawCenterImage();
    drawGrid();
    drawEdges();
    drawNodes();
    drawStickman();

    requestAnimationFrame(tick);
  }
  tick();

  // API for UI to update progress
  function completeStage(id){
    progress.completed.add(id);
    const idx = nodes.findIndex(n=>n.id===id);
    if(idx>=0){
      nodes[idx].completed = true;
      const next = nodes[idx+1];
      if(next){ next.unlocked = true; progress.unlocked.add(next.id); }
    }
    updateHud();
    // Persist if auth layer is present
    if(window.Auth && typeof window.Auth.saveProgress === 'function'){
      try{ window.Auth.saveProgress(exportProgress()); }catch(_){ }
    }
  }

  function addReward(xp=10, coins=5){
    progress.xp += xp; progress.coins += coins; updateHud();
    toast(`+${xp} XP  +${coins} coins`);
    // Persist if auth layer is present
    if(window.Auth && typeof window.Auth.saveProgress === 'function'){
      try{ window.Auth.saveProgress(exportProgress()); }catch(_){ }
    }
  }

  function updateHud(){
    const xpEl = document.getElementById('xp');
    const cEl = document.getElementById('coins');
    if(xpEl) xpEl.textContent = `XP: ${progress.xp}`;
    if(cEl) cEl.textContent = `Coins: ${progress.coins}`;
  }

  // Import/export helpers for progress persistence
  function exportProgress(){
    return {
      unlocked: Array.from(progress.unlocked),
      completed: Array.from(progress.completed),
      xp: progress.xp,
      coins: progress.coins,
    };
  }
  function importProgress(data){
    if(!data) return;
    try{
      progress.unlocked.clear();
      progress.completed.clear();
      (data.unlocked || [1]).forEach(id=> progress.unlocked.add(id));
      (data.completed || []).forEach(id=> progress.completed.add(id));
      progress.xp = data.xp || 0;
      progress.coins = data.coins || 0;
      // reflect into nodes
      nodes.forEach(n=>{
        n.unlocked = progress.unlocked.has(n.id);
        n.completed = progress.completed.has(n.id);
      });
      updateHud();
    }catch(_){ /* ignore */ }
  }

  function toast(msg){
    const el = document.getElementById('toast');
    el.textContent = msg; el.classList.remove('hidden');
    setTimeout(()=>el.classList.add('hidden'), 1600);
  }

  window.World = {
    completeStage,
    addReward,
    goToNodeById: (id)=>{
      const n = nodes.find(nn=>nn.id===id && nn.unlocked);
      if(n) goToNode(n);
    },
    exportProgress,
    importProgress,
  };
})();