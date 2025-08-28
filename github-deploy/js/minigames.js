// minigames.js — Lightweight, stage-specific mini-game implementations without frameworks.

(function(){
  function el(tag, cls, text){ const e=document.createElement(tag); if(cls) e.className=cls; if(text) e.textContent=text; return e; }
  function btn(label, cls){ const b=el('button', cls||'primary'); b.textContent=label; return b; }

  // drag-drop utility
  function makeDraggable(elem){
    elem.draggable = true;
    elem.addEventListener('dragstart', e=>{
      e.dataTransfer.setData('text/plain', elem.dataset.value||elem.textContent);
      elem.classList.add('dragging');
    });
    elem.addEventListener('dragend', ()=>elem.classList.remove('dragging'));
  }

  function makeDropzone(elem, acceptCb){
    elem.addEventListener('dragover', e=>{ e.preventDefault(); elem.style.outline='1px solid rgba(0,255,153,0.6)'; });
    elem.addEventListener('dragleave', ()=>{ elem.style.outline='none'; });
    elem.addEventListener('drop', e=>{
      e.preventDefault(); elem.style.outline='none';
      const v = e.dataTransfer.getData('text/plain');
      acceptCb(v, elem);
    });
  }

  // Mini-game factory
  function createMinigame(root, stage){
    const cfg = stage.minigame || {};
    switch(cfg.type){
      case 'drag-drop-datatype': return gameDragDropDatatype(root, cfg);
      case 'terminal-gates': return gameTerminalGates(root, cfg);
      case 'reorder-fragments': return gameReorderFragments(root, cfg);
      case 'index-grab': return gameIndexGrab(root, cfg);
      case 'chests-keys': return gameChestsKeys(root, cfg);
      case 'true-false-tunnel': return gameTrueFalseTunnel(root, cfg);
      case 'platforms-loop': return gamePlatformsLoop(root, cfg);
      case 'bridge-function': return gameBridgeFunction(root, cfg);
      case 'modules-puzzle': return gameModulesPuzzle(root, cfg);
      case 'scrolls-files': return gameScrollsFiles(root, cfg);
      case 'error-bombs': return gameErrorBombs(root, cfg);
      case 'oop-clones': return gameOOPClones(root, cfg);
      case 'decorators-energy': return gameDecoratorsEnergy(root, cfg);
      case 'boss-project': return gameBossProject(root, cfg);
      default:
        root.textContent = 'Mini-game coming soon...';
        return ()=>false;
    }
  }

  // Game 1: drag values to types
  function gameDragDropDatatype(root, cfg){
    root.innerHTML = '';
    const bank = el('div','bank');
    const zones = el('div','zones');
    cfg.items.forEach(v=>{
      const it = el('div','tile glow-green', v);
      it.dataset.value = v;
      makeDraggable(it);
      bank.appendChild(it);
    });
    cfg.targets.forEach(t=>{
      const z = el('div','zone'); z.dataset.type = t;
      z.appendChild(el('div','label', t));
      makeDropzone(z, (v,zone)=>{
        const correct = (t==='int' && /^\d+$/.test(v)) || (t==='str' && /^".*"$/.test(v)) || (t==='bool' && /^(True|False)$/i.test(v));
        zone.style.background = correct? 'rgba(0,255,153,0.12)':'rgba(255,46,99,0.12)';
        zone.dataset.filled = correct? '1':'0';
      });
      zones.appendChild(z);
    });
    root.appendChild(bank); root.appendChild(zones);

    return ()=>{
      return [...zones.children].every(z=>z.dataset.filled==='1');
    };
  }

  // Game 2: terminal gates
  function gameTerminalGates(root, cfg){
    root.innerHTML='';
    cfg.gates.forEach(g=>{
      const row = el('div','row');
      row.appendChild(el('div','label', `Solve: ${g.expr}`));
      const input = el('input'); input.placeholder = 'type result'; input.className='primary';
      row.appendChild(input);
      const light = el('span','label','🔒');
      row.appendChild(light);
      input.addEventListener('input',()=>{
        light.textContent = (input.value.trim()===g.ans)?'🔓':'🔒';
      })
      root.appendChild(row);
    });
    return ()=>{
      const rows=[...root.querySelectorAll('input')];
      return rows.every((i,idx)=> i.value.trim()===cfg.gates[idx].ans);
    };
  }

  // Game 3: reorder fragments to target string
  function gameReorderFragments(root, cfg){
    root.innerHTML='';
    const list = el('div','bank');
    cfg.fragments.forEach((f,i)=>{
      const tile = el('div','tile glow-green', f); tile.dataset.value=f; tile.contentEditable='true';
      tile.style.cursor='grab';
      tile.addEventListener('mousedown',()=> tile.dataset.dragging='1');
      tile.addEventListener('mouseup',()=> tile.dataset.dragging='0');
      list.appendChild(tile);
    });
    list.addEventListener('mousemove', (e)=>{
      const dragging = [...list.children].find(c=>c.dataset.dragging==='1');
      if(!dragging) return;
      const over = [...list.children].find(c=> c!==dragging && e.clientX>=c.getBoundingClientRect().left && e.clientX<=c.getBoundingClientRect().right);
      if(over){
        if(e.clientX < over.getBoundingClientRect().left + over.offsetWidth/2){
          list.insertBefore(dragging, over);
        } else {
          list.insertBefore(dragging, over.nextSibling);
        }
      }
    });
    root.appendChild(list);
    return ()=>{
      const s=[...list.children].map(c=>c.dataset.value).join('');
      return s===cfg.target;
    };
  }

  // Game 4: index grab (simple check)
  function gameIndexGrab(root, cfg){
    root.innerHTML='';
    root.appendChild(el('div','label', cfg.prompt||'Grab index'));
    const input = el('input'); input.placeholder='Enter index you grabbed'; input.className='primary';
    root.appendChild(input);
    return ()=> input.value.trim()==='2';
  }

  // Game 5: chests and keys
  function gameChestsKeys(root, cfg){
    root.innerHTML='';
    const bank = el('div','bank');
    cfg.values.forEach(v=>{
      const it = el('div','tile glow-green', v); it.dataset.value=v; makeDraggable(it); bank.appendChild(it);
    });
    const row = el('div','zones');
    cfg.keys.forEach(k=>{
      const zone = el('div','zone'); zone.appendChild(el('div','label', `{${k}: ?}`));
      makeDropzone(zone, (v,z)=>{ z.dataset.filled=(k==='a'&&v==='1')||(k==='b'&&v==='2')?'1':'0'; z.style.background = z.dataset.filled==='1'? 'rgba(0,255,153,0.12)':'rgba(255,46,99,0.12)'; })
      row.appendChild(zone);
    });
    root.appendChild(bank); root.appendChild(row);
    return ()=> [...root.querySelectorAll('.zone')].every(z=>z.dataset.filled==='1');
  }

  // Game 6: true/false tunnel selection
  function gameTrueFalseTunnel(root, cfg){
    root.innerHTML='';
    root.appendChild(el('div','label', `Condition: ${cfg.condition}`));
    const trueBtn = btn('True'); const falseBtn = btn('False');
    root.appendChild(trueBtn); root.appendChild(falseBtn);
    let correct = false;
    trueBtn.onclick=()=>{ correct=false; flash(falseBtn); };
    falseBtn.onclick=()=>{ correct=true; flash(trueBtn); };
    function flash(b){ b.classList.add('glow-green'); setTimeout(()=>b.classList.remove('glow-green'), 600); }
    return ()=> correct;
  }

  // Game 7: platforms loop count
  function gamePlatformsLoop(root, cfg){
    root.innerHTML='';
    root.appendChild(el('div','label','Enter range(n) to spawn n platforms'));
    const input = el('input'); input.placeholder='n'; input.className='primary'; root.appendChild(input);
    const area = el('div','bank'); area.style.minHeight='80px'; root.appendChild(area);
    input.addEventListener('input',()=>{
      const n = parseInt(input.value.trim(),10); area.innerHTML='';
      if(!isNaN(n) && n>0 && n<21){
        for(let i=0;i<n;i++){ area.appendChild(el('span','tile', '#')); }
      }
    })
    return ()=> parseInt(input.value.trim(),10)===cfg.count;
  }

  // Game 8: bridge function
  function gameBridgeFunction(root){
    root.innerHTML='';
    root.appendChild(el('div','label','Type the parts to build function: def, return'));
    const a = el('input'); a.placeholder='keyword 1'; a.className='primary';
    const b = el('input'); b.placeholder='keyword 2'; b.className='primary';
    root.appendChild(a); root.appendChild(b);
    return ()=> a.value.trim()==='def' && b.value.trim()==='return';
  }

  // Game 9: modules puzzle
  function gameModulesPuzzle(root, cfg){
    root.innerHTML='';
    const bank = el('div','bank'); cfg.modules.forEach(m=>{ const t=el('div','tile glow-green', m); t.dataset.value=m; makeDraggable(t); bank.appendChild(t); });
    const slot = el('div','zone'); slot.appendChild(el('div','label','Place module to compute sqrt(9)'));
    makeDropzone(slot, (v,z)=>{ z.dataset.filled=(v==='math')?'1':'0'; z.style.background = z.dataset.filled==='1'? 'rgba(0,255,153,0.12)':'rgba(255,46,99,0.12)'; })
    root.appendChild(bank); root.appendChild(slot);
    return ()=> slot.dataset.filled==='1';
  }

  // Game 10: scrolls files
  function gameScrollsFiles(root){
    root.innerHTML='';
    const select = el('select'); ['read','write','append'].forEach(a=> select.appendChild(el('option','',a)) );
    root.appendChild(el('div','label','Choose mode for "w"')); root.appendChild(select);
    return ()=> select.value==='write';
  }

  // Game 11: error bombs
  function gameErrorBombs(root){
    root.innerHTML='';
    root.appendChild(el('div','label','Type try and except to defuse'));
    const a=el('input'); a.placeholder='first keyword'; a.className='primary';
    const b=el('input'); b.placeholder='second keyword'; b.className='primary';
    root.appendChild(a); root.appendChild(b);
    return ()=> a.value.trim()==='try' && b.value.trim().startsWith('except');
  }

  // Game 12: OOP clones
  function gameOOPClones(root){
    root.innerHTML='';
    const attrs=['color','speed','size'];
    const inputs=attrs.map(n=>{ const i=el('input'); i.placeholder=n; i.className='primary'; root.appendChild(i); return i; });
    return ()=> inputs.every(i=> i.value.trim().length>0);
  }

  // Game 13: decorators energy
  function gameDecoratorsEnergy(root){
    root.innerHTML='';
    root.appendChild(el('div','label','Apply @decorator and use yield'));
    const a=el('input'); a.placeholder='@...'; a.className='primary';
    const b=el('input'); b.placeholder='keyword'; b.className='primary';
    root.appendChild(a); root.appendChild(b);
    return ()=> a.value.trim().startsWith('@') && b.value.trim()==='yield';
  }

  // Game 14: boss project (simplified success toggle)
  function gameBossProject(root){
    root.innerHTML='';
    root.appendChild(el('div','label','Choose a project to implement'));
    const sel = el('select'); ['Password generator','Simple calculator'].forEach(p=> sel.appendChild(el('option','',p)) );
    root.appendChild(sel);
    return ()=> ['Password generator','Simple calculator'].includes(sel.value);
  }

  window.MiniGames = { createMinigame };
})();