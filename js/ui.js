// ui.js — Handles panel UI, tabs, quizzes, unlock logic, and connects with world and minigames.

(function(){
  const overlay = document.getElementById('ui-overlay');
  const lessonContent = document.getElementById('lessonContent');
  const quizContent = document.getElementById('quizContent');
  const minigameRoot = document.getElementById('minigameRoot');
  const stageTitleEl = document.getElementById('stageTitle');
  const unlockBtn = document.getElementById('unlockNext');
  const quizFeedback = document.getElementById('quizFeedback');
  const minigameFeedback = document.getElementById('minigameFeedback');
  const submitQuizBtn = document.getElementById('submitQuiz');
  const nextQuestionBtn = document.getElementById('nextQuestion');
  // New: Lesson slide controls
  const prevSlideBtn = document.getElementById('prevSlide');
  const nextSlideBtn = document.getElementById('nextSlide');
  const slideProgressEl = document.getElementById('slideProgress');

  // New: Python console elements
  const consoleInput = document.getElementById('consoleInput');
  const runCodeBtn = document.getElementById('runCode');
  const formatCodeBtn = document.getElementById('formatCode');
  const clearConsoleBtn = document.getElementById('clearConsole');
  const consoleOutput = document.getElementById('consoleOutput');
  const consoleHints = document.getElementById('consoleHints');

  const PASS_RATIO = 0.7; // 70% correct to pass bank quizzes

  let currentStage = null;
  let quizPassed = false;
  let minigameComplete = false;
  let minigameCheck = ()=>false;

  // Bank quiz state
  let bankMode = false;
  let bankQuestions = [];
  let bankIdx = 0;
  let bankCorrect = 0;
  let bankAnswered = false;

  // Lesson slides state
  let slides = [];
  let slideIdx = 0;

  // Python console state
  let pyodide = null;
  let pyodideLoading = null;
  let consoleInitialized = false;
  let stageWordSuggestions = [];
  // Add flags to prevent duplicate announcements
  let pyodideReadyAnnounced = false;
  let pyodideEchoRan = false;

  // Instrument global errors to surface issues in the in-page console
  window.addEventListener('error', (e)=>{
    try { appendToConsole('JS Error: '+ (e?.message || e?.error?.message || String(e)), 'glow-red'); } catch(_){}
  });
  window.addEventListener('unhandledrejection', (e)=>{
    try { appendToConsole('Unhandled Promise Rejection: '+ (e?.reason?.message || String(e?.reason)), 'glow-red'); } catch(_){}
  });

  // Fallback: delegated handlers to ensure Run/Enter work even if initConsoleOnce() hasn't bound yet
  document.addEventListener('click', (e)=>{
    const t = e.target;
    if(!t) return;
    if(t.id === 'runCode'){
      if(!consoleInitialized){ appendToConsole('Run clicked (delegated)…'); initConsoleOnce(); runConsoleCode(); }
      // if initialized, the direct handler will take over
    } else if(t.id === 'clearConsole'){
      if(!consoleInitialized){ initConsoleOnce(); }
      if(consoleOutput){ consoleOutput.textContent=''; }
      if(consoleInput){ consoleInput.value=''; consoleInput.focus(); }
    }
  });
  document.addEventListener('keydown', (e)=>{
    const t = e.target;
    if(!t) return;
    if(t.id === 'consoleInput'){
      if(!consoleInitialized){ initConsoleOnce(); }
      if(e.key === 'Enter'){
        e.preventDefault();
        runConsoleCode();
      } else if(e.key === 'Tab'){
        const applied = applyAutocomplete();
        if(applied){ e.preventDefault(); }
      }
    }
  });

  // Helper: update console status/hints
  function setConsoleStatus(msg){
    if(consoleHints){ consoleHints.textContent = msg; }
  }

  function appendToConsole(text, cls){
    if(!consoleOutput) return;
    const line = document.createElement('div');
    line.textContent = text;
    if(cls) line.className = cls;
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }

  // Start background warmup immediately on page load (non-blocking, no UI disruption)
  const startPyWarmup = () => warmupPyodide({ background: true }).catch(()=>{});
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => {
      if('requestIdleCallback' in window){
        try { requestIdleCallback(() => startPyWarmup(), { timeout: 10000 }); }
        catch(_){ setTimeout(startPyWarmup, 50); }
      } else {
        setTimeout(startPyWarmup, 50);
      }
    });
  } else {
    if('requestIdleCallback' in window){
      try { requestIdleCallback(() => startPyWarmup(), { timeout: 10000 }); }
      catch(_){ setTimeout(startPyWarmup, 50); }
    } else {
      setTimeout(startPyWarmup, 50);
    }
  }

  // Ensure Pyodide loader with timeout and stdout wiring
  async function ensurePyodideWithTimeout(timeoutMs = 45000){
    if(pyodide){ return pyodide; }
    if(!pyodideLoading){
      if(typeof loadPyodide !== 'function'){
        throw new Error('Pyodide script not loaded');
      }
      pyodideLoading = loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/' });
    }
    const withTimeout = new Promise((resolve, reject)=>{
      const t = setTimeout(()=> reject(new Error('Timed out loading Python runtime')), timeoutMs);
      pyodideLoading.then(pyo=>{ clearTimeout(t); resolve(pyo); }).catch(err=>{ clearTimeout(t); reject(err); });
    });
    pyodide = await withTimeout;
    try {
      // Wire stdout/stderr to in-page console
      if(pyodide?.setStdout){ pyodide.setStdout({ batched: (s)=>{ if(s){ appendToConsole(s.trim()); } } }); }
      if(pyodide?.setStderr){ pyodide.setStderr({ batched: (s)=>{ if(s){ appendToConsole(s.trim(), 'glow-red'); } } }); }
    } catch(_) { /* ignore wiring issues */ }
    return pyodide;
  }

  // Tabs
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(b=> b.addEventListener('click', ()=>{
    tabs.forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    document.querySelectorAll('.tab').forEach(t=> t.classList.remove('active'));
    document.getElementById('tab-'+b.dataset.tab).classList.add('active');
    // Focus console input if switching to lesson tab
    if(b.dataset.tab === 'lesson' && consoleInput){ consoleInput.focus(); }
  }));

  // Close panel
  document.getElementById('closePanel').addEventListener('click', ()=> overlay.classList.add('hidden'));

  // Quiz submit
  submitQuizBtn.addEventListener('click', ()=>{
    if(!currentStage) return;
    const q = currentStage.quiz;
    // Bank flow
    if(q?.type === 'bank' && bankMode){
      const cur = bankQuestions[bankIdx];
      if(!cur){ return; }
      let correct = false;
      if(cur.type==='mc'){
        const chosen = [...quizContent.querySelectorAll('input[name="mc"]')].find(i=>i.checked);
        if(chosen) correct = parseInt(chosen.value,10)===cur.correct;
      } else if(cur.type==='fill'){
        const v = quizContent.querySelector('input')?.value?.trim();
        correct = (v===cur.correct);
      }
      bankAnswered = true;
      if(correct){ bankCorrect++; quizFeedback.textContent = `Correct! (${bankCorrect}/${bankQuestions.length})`; quizFeedback.className='feedback glow-green'; window.World.addReward(2,1); }
      else { quizFeedback.textContent = 'Incorrect. You can still proceed to the next question.'; quizFeedback.className='feedback glow-red'; }
      submitQuizBtn.disabled = true;
      nextQuestionBtn.disabled = false;
      // If last question, finalize
      if(bankIdx === bankQuestions.length - 1){
        finalizeBankQuiz();
      }
      checkUnlock();
      return;
    }

    // Single question flow (legacy)
    let correct = false;
    if(q?.type==='mc'){
      const chosen = [...quizContent.querySelectorAll('input[name="mc"]')].find(i=>i.checked);
      if(chosen) correct = parseInt(chosen.value,10)===q.correct;
    } else if(q?.type==='fill'){
      const v = quizContent.querySelector('input')?.value?.trim();
      correct = (v===q.correct);
    }
    quizPassed = !!correct;
    quizFeedback.textContent = correct? 'Correct!': 'Try again';
    quizFeedback.className = 'feedback ' + (correct? 'glow-green':'glow-red');
    checkUnlock();
    if(correct){ window.World.addReward(10,5); }
  });

  // Next question for bank quizzes
  nextQuestionBtn.addEventListener('click', ()=>{
    if(!bankMode) return;
    if(bankIdx < bankQuestions.length - 1){
      bankIdx++;
      renderBankQuestion();
    } else {
      finalizeBankQuiz();
    }
  });

  function finalizeBankQuiz(){
    const total = bankQuestions.length || 1;
    const ratio = bankCorrect/total;
    quizPassed = ratio >= PASS_RATIO;
    quizFeedback.textContent = quizPassed ? `Great! You passed (${bankCorrect}/${total}).` : `Keep practicing. You got ${bankCorrect}/${total}.`;
    quizFeedback.className = 'feedback ' + (quizPassed ? 'glow-green' : 'glow-red');
    submitQuizBtn.disabled = true;
    nextQuestionBtn.disabled = true;
  }

  function renderBankQuestion(){
    submitQuizBtn.disabled = false;
    nextQuestionBtn.disabled = true;
    quizContent.innerHTML='';
    const cur = bankQuestions[bankIdx];
    if(!cur){ return; }
    const qEl = document.createElement('div'); qEl.textContent = cur.question; qEl.className='monospace'; quizContent.appendChild(qEl);
    if(cur.type==='mc'){
      cur.choices.forEach((c,idx)=>{
        const row = document.createElement('label'); row.style.display='block'; row.style.margin='6px 0';
        const input = document.createElement('input'); input.type='radio'; input.name='mc'; input.value=String(idx);
        row.appendChild(input);
        const span = document.createElement('span'); span.textContent=' '+c; row.appendChild(span);
        quizContent.appendChild(row);
      });
    } else if(cur.type==='fill'){
      const input = document.createElement('input'); input.placeholder='your answer'; input.className='primary'; quizContent.appendChild(input);
    }
  }

  function renderLesson(stage){
    // Determine slides source
    slides = Array.isArray(stage?.lessonSlides) && stage.lessonSlides.length > 0
      ? stage.lessonSlides
      : (stage?.lesson ? [stage.lesson] : ['Under construction — lesson content coming soon.']);
    slideIdx = 0;
    renderCurrentSlide();
  }

  function renderCurrentSlide(){
    lessonContent.textContent = slides[slideIdx] || '';
    // Update slide controls
    if(slideProgressEl){
      slideProgressEl.textContent = `${slideIdx+1} / ${slides.length}`;
    }
    if(prevSlideBtn){ prevSlideBtn.disabled = slideIdx <= 0; }
    if(nextSlideBtn){ prevSlideBtn && (nextSlideBtn.disabled = slideIdx >= slides.length - 1); }
  }

  // Slide navigation handlers
  if(prevSlideBtn){
    prevSlideBtn.addEventListener('click', ()=>{
      if(slideIdx > 0){ slideIdx--; renderCurrentSlide(); }
    });
  }
  if(nextSlideBtn){
    nextSlideBtn.addEventListener('click', ()=>{
      if(slideIdx < slides.length - 1){ slideIdx++; renderCurrentSlide(); }
    });
  }

  function renderQuiz(stage){
    quizContent.innerHTML='';
    quizFeedback.textContent='';
    const q = stage && stage.quiz;
    // Bank mode
    if(q && q.type === 'bank' && Array.isArray(q.questions)){
      bankMode = true;
      bankQuestions = q.questions;
      bankIdx = 0;
      bankCorrect = 0;
      renderBankQuestion();
      return;
    }

    // Single-question mode
    bankMode = false;
    if(q && q.type==='mc'){
      const qEl = document.createElement('div'); qEl.textContent = q.question; qEl.className='monospace'; quizContent.appendChild(qEl);
      q.choices.forEach((c,idx)=>{
        const row = document.createElement('label'); row.style.display='block'; row.style.margin='6px 0';
        const input = document.createElement('input'); input.type='radio'; input.name='mc'; input.value=String(idx);
        row.appendChild(input);
        const span = document.createElement('span'); span.textContent=' '+c; row.appendChild(span);
        quizContent.appendChild(row);
      });
      submitQuizBtn.disabled = false;
      nextQuestionBtn.disabled = true;
    } else if(q && q.type==='fill'){
      const qEl = document.createElement('div'); qEl.textContent = q.question; qEl.className='monospace'; quizContent.appendChild(qEl);
      const input = document.createElement('input'); input.placeholder='your answer'; input.className='primary'; quizContent.appendChild(input);
      submitQuizBtn.disabled = false;
      nextQuestionBtn.disabled = true;
    } else {
      const msg = document.createElement('div'); msg.className='monospace'; msg.textContent = 'Under construction — quiz coming soon.'; quizContent.appendChild(msg);
      submitQuizBtn.disabled = true;
      nextQuestionBtn.disabled = true;
    }
  }

  function renderMinigame(stage){
    miniggameRootSafeClear();
    if(stage && stage.minigame){
      minigameCheck = window.MiniGames.createMinigame(minigameRoot, stage);
    } else {
      const msg = document.createElement('div'); msg.className='monospace'; msg.textContent='Under construction — minigame coming soon.'; minigameRoot.appendChild(msg);
      minigameCheck = ()=>false;
    }
  }

  function miniggameRootSafeClear(){
    try { minigameRoot.innerHTML=''; } catch(e){ while(minigameRoot.firstChild){ minigameRoot.removeChild(minigameRoot.firstChild); } }
  }

  function checkUnlock(){
    const ok = quizPassed && minigameComplete;
    unlockBtn.disabled = !ok;
  }

  unlockBtn.addEventListener('click', ()=>{
    if(!currentStage) return;
    window.World.completeStage(currentStage.id);
    overlay.classList.add('hidden');
  });

  function openPanel(stage){
    currentStage = stage || { id: '?', title: 'Under Construction', lesson: null, quiz: null, minigame: null };
    stageTitleEl.textContent = `${currentStage.id}. ${currentStage.title}`;
    // reset state
    quizPassed = false; minigameComplete = false; quizFeedback.textContent=''; minigameFeedback.textContent='';
    bankMode = false; bankQuestions = []; bankIdx = 0; bankCorrect = 0; bankAnswered = false;
    renderLesson(currentStage);
    renderQuiz(currentStage);
    renderMinigame(currentStage);
    unlockBtn.disabled = true;
    overlay.classList.remove('hidden');
    // Initialize and focus console
    initConsoleOnce();
    seedStageHints(currentStage);
    // Background warmup is triggered globally at page load; no need to duplicate it here.
    if(consoleInput){ consoleInput.focus(); }
  }

  // Modify: warmupPyodide supports background mode
  async function warmupPyodide(opts = {}){
    const background = !!opts.background;
    try {
      if(!pyodide){
        if(!background){
          setConsoleStatus('Loading Python runtime… (first load may take 10–20s)');
          runCodeBtn && (runCodeBtn.disabled = true);
        }
        const pyo = await ensurePyodideWithTimeout(60000);
        try {
          if(!pyodideEchoRan){
            pyodideEchoRan = true;
            await pyo.runPythonAsync('import sys\nprint("Python "+sys.version.split()[0]+" ready")');
          }
          if(!pyodideReadyAnnounced){
            pyodideReadyAnnounced = true;
            appendToConsole('Python runtime ready.', 'glow-green');
          }
        } catch(_e) { /* ignore */ }
        if(!background){ setConsoleStatus('Try: print("Hello")'); }
      }
    } catch(e){
      const msg = String(e||'');
      if(msg.includes('Timed out')){
        if(!background){
          setConsoleStatus('Python runtime is still loading… using fast mode for now. It will switch when ready.');
          appendToConsole('Python runtime is still loading… falling back temporarily.');
        }
      } else {
        if(!background){
          setConsoleStatus('Failed to load Python runtime. Check your network and try again.');
          appendToConsole('Error loading Python runtime: '+ msg, 'glow-red');
        }
      }
    } finally {
      if(!background){ runCodeBtn && (runCodeBtn.disabled = false); }
    }
  }

  // ----- Fast Python-like console implementation -----

  // Python-like interpreter variables and functions
  let consoleVars = {};

  function initConsoleOnce(){
    if(consoleInitialized) return;
    consoleInitialized = true;
    // Initialize built-in functions
    consoleVars = {
      'abs': Math.abs,
      'max': Math.max,
      'min': Math.min,
      'round': Math.round,
      'len': (obj) => {
        if(typeof obj === 'string' || Array.isArray(obj)) return obj.length;
        if(typeof obj === 'object' && obj !== null) return Object.keys(obj).length;
        return 0;
      },
      'range': (start, stop, step = 1) => {
        if(stop === undefined) { stop = start; start = 0; }
        const result = [];
        for(let i = start; i < stop; i += step) result.push(i);
        return result;
      },
      'sum': (arr) => Array.isArray(arr) ? arr.reduce((a,b) => a+b, 0) : 0,
      'type': (obj) => Array.isArray(obj) ? 'list' : typeof obj,
      'str': (obj) => String(obj),
      'int': (obj) => parseInt(obj, 10) || 0,
      'float': (obj) => parseFloat(obj) || 0.0,
      'bool': (obj) => Boolean(obj),
      'list': (...args) => Array.from(args),
      'dict': () => ({}),
    };
    
    setConsoleStatus('Fast Python console ready! Try: print(2+2)');
    
    if(clearConsoleBtn){ 
      clearConsoleBtn.addEventListener('click', ()=>{ 
        if(consoleOutput){ consoleOutput.textContent=''; } 
        consoleInput && (consoleInput.value=''); 
        consoleInput && consoleInput.focus(); 
        consoleVars = {...consoleVars}; // Reset variables but keep built-ins
      }); 
    }
    if(runCodeBtn){
      runCodeBtn.addEventListener('click', ()=>{
        runConsoleCode();
      });
    }
    if(formatCodeBtn){
      formatCodeBtn.addEventListener('click', ()=>{
        formatPythonCode();
      });
    }
    if(consoleInput){
      consoleInput.addEventListener('keydown', (e)=>{
        if(e.key === 'Enter' && e.ctrlKey){
          // Ctrl+Enter: Execute code
          e.preventDefault();
          runConsoleCode();
        } else if(e.key === 'Enter' && !e.shiftKey && !e.ctrlKey){
          // Plain Enter: Add new line (default textarea behavior)
          // But if it looks like a complete statement, suggest running
          const code = consoleInput.value.trim();
          if(code && !needsMoreInput(code) && !code.includes('\n')){
            // Single line that looks complete
            setTimeout(() => {
              setConsoleStatus('Tip: Press Ctrl+Enter to run, or continue typing for multi-line code.');
            }, 100);
          }
        } else if(e.key === 'Tab'){
          e.preventDefault();
          const applied = applyAutocomplete();
          if(!applied){
            // Insert 4 spaces for indentation
            const start = consoleInput.selectionStart;
            const end = consoleInput.selectionEnd;
            const value = consoleInput.value;
            consoleInput.value = value.substring(0, start) + '    ' + value.substring(end);
            consoleInput.selectionStart = consoleInput.selectionEnd = start + 4;
          }
        }
      });
      consoleInput.addEventListener('input', updateHints);
    }
  }

  function appendToConsole(text, cls){
    if(!consoleOutput) return;
    const line = document.createElement('div');
    line.textContent = text;
    if(cls) line.className = cls;
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }

  function getCurrentToken(){
    if(!consoleInput) return '';
    const val = consoleInput.value;
    const pos = consoleInput.selectionStart || val.length;
    const upToCursor = val.slice(0, pos);
    const m = upToCursor.match(/([A-Za-z_][A-Za-z0-9_]*)$/);
    return m ? m[1] : '';
  }

  function formatPythonCode(){
    if(!consoleInput) return;
    const code = consoleInput.value;
    if(!code.trim()) return;
    
    // Basic Python code formatting
    const lines = code.split('\n');
    const formatted = [];
    let indentLevel = 0;
    
    for(let line of lines){
      const trimmed = line.trim();
      if(!trimmed){
        formatted.push('');
        continue;
      }
      
      // Decrease indent for else, elif, except, finally
      if(/^(else|elif|except|finally):/.test(trimmed)){
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      // Add proper indentation
      formatted.push('    '.repeat(indentLevel) + trimmed);
      
      // Increase indent after colon
      if(trimmed.endsWith(':')){
        indentLevel++;
      }
      
      // Decrease indent after certain keywords
      if(/^(return|break|continue|pass)/.test(trimmed)){
        // These don't change indentation for next line
      }
    }
    
    consoleInput.value = formatted.join('\n');
    setConsoleStatus('Code formatted!');
  }

  function applyAutocomplete(){
    const token = getCurrentToken();
    if(!token) return false;
    const suggestions = getSuggestions(token);
    if(!suggestions.length) return false;
    const best = suggestions[0];
    // replace token at cursor with best
    const val = consoleInput.value;
    const pos = consoleInput.selectionStart || val.length;
    const start = pos - token.length;
    consoleInput.value = val.slice(0,start) + best + val.slice(pos);
    const newPos = start + best.length;
    consoleInput.setSelectionRange(newPos, newPos);
    updateHints();
    return true;
  }

  const PY_KEYWORDS = ['False','None','True','and','as','assert','async','await','break','class','continue','def','del','elif','else','except','finally','for','from','global','if','import','in','is','lambda','nonlocal','not','or','pass','raise','return','try','while','with','yield'];
  const PY_BUILTINS = ['abs','all','any','ascii','bin','bool','bytearray','bytes','callable','chr','classmethod','compile','complex','delattr','dict','dir','divmod','enumerate','eval','exec','filter','float','format','frozenset','getattr','globals','hasattr','hash','help','hex','id','input','int','isinstance','issubclass','iter','len','list','locals','map','max','memoryview','min','next','object','oct','open','ord','pow','print','property','range','repr','reversed','round','set','setattr','slice','sorted','staticmethod','str','sum','super','tuple','type','vars','zip'];

  function seedStageHints(stage){
    // Extract frequent words from slides to suggest stage-relevant terms
    const text = (Array.isArray(stage.lessonSlides) ? stage.lessonSlides.join('\n') : (stage.lesson||''));
    const words = (text.match(/[A-Za-z_][A-Za-z0-9_]*/g) || []).map(w=>w.trim()).filter(w=>w.length>2);
    const freq = {};
    words.forEach(w=>{ freq[w]=(freq[w]||0)+1; });
    const unique = Object.keys(freq).sort((a,b)=> freq[b]-freq[a]);
    // prioritize common Python-y tokens appearing in slides
    stageWordSuggestions = unique.slice(0,80);
    updateHints();
  }

  function getSuggestions(prefix){
    const pool = [...stageWordSuggestions, ...PY_BUILTINS, ...PY_KEYWORDS];
    const lower = prefix.toLowerCase();
    const seen = new Set();
    const results = [];
    for(const w of pool){
      if(!w) continue;
      if(seen.has(w)) continue;
      if(w.toLowerCase().startsWith(lower) && w !== prefix){
        results.push(w); seen.add(w);
      }
      if(results.length>=10) break;
    }
    return results;
  }

  function updateHints(){
    if(!consoleHints || !consoleInput) return;
    const token = getCurrentToken();
    if(!token){
      consoleHints.textContent = '💡 Tip: Press Tab for autocomplete/indent, Ctrl+Enter to run, Format button to clean up code.';
      return;
    }
    const suggestions = getSuggestions(token).slice(0,5);
    if(!suggestions.length){
      consoleHints.textContent = `No suggestions for "${token}" | Ctrl+Enter to run`;
    } else {
      consoleHints.textContent = `Autocomplete: ${suggestions.join(', ')} | Ctrl+Enter to run`;
    }
  }

  function runConsoleCode(){
    if(!consoleInput) return;
    const code = consoleInput.value.trim();
    if(!code){
      setConsoleStatus('Type some Python code (e.g., print(2+2)) and press Ctrl+Enter to run.');
      consoleInput.focus();
      return;
    }
    
    // Display the code being executed
    appendToConsole(`>>> ${code.replace(/\n/g, '\n... ')}`);
    consoleInput.value = '';
    updateHints();
    
    runPythonCode(code);
  }

  function needsMoreInput(code){
    const trimmedCode = code.trim();
    if(!trimmedCode) return false;
    
    // Check if ends with colon (indicates block start)
    if(trimmedCode.endsWith(':')){
      return true;
    }
    
    // Check for incomplete blocks by looking at indentation
    const lines = code.split('\n');
    if(lines.length > 1){
      const lastLine = lines[lines.length - 1];
      const secondLastLine = lines[lines.length - 2];
      
      // If last line is empty but second-to-last has indentation, we're done
      if(lastLine.trim() === '' && secondLastLine.match(/^\s+/)){
        return false;
      }
      
      // If last line has indentation, we might need more
      if(lastLine.match(/^\s+/) && lastLine.trim() !== ''){
        return true;
      }
    }
    
    return false;
  }

  async function runPythonCode(code){
    try {
      setConsoleStatus('Running Python code...');
      // Prefer real Python via Pyodide if available/loads fast; otherwise fallback
      try {
        const pyo = await ensurePyodideWithTimeout(5000);
        const result = await pyo.runPythonAsync(code);
        if(result !== undefined && result !== null){
          appendToConsole(String(result));
        }
        setConsoleStatus('Ready for next command');
        return;
      } catch(_e){
        // Fallback to fast JS-based interpreter
      }
      const result = executeEnhancedPython(code);
      setConsoleStatus('Ready for next command');
    } catch(e){
      appendToConsole('Error: ' + String(e), 'glow-red');
      setConsoleStatus('Error occurred - check your syntax');
    }
  }

  function executeEnhancedPython(code){
    // Initialize Python context if not exists
    if(!consoleVars.pythonContext){
      initPythonContext();
    }
    
    const lines = code.split('\n').map(line => line.trimRight());
    let i = 0;
    
    while(i < lines.length){
      const line = lines[i];
      if(!line.trim()) {
        i++;
        continue;
      }
      
      i = executeLine(lines, i);
    }
  }

  function initPythonContext(){
    consoleVars.pythonContext = {
      variables: {},
      functions: {},
      imports: {
        math: {
          pi: Math.PI,
          e: Math.E,
          sqrt: Math.sqrt,
          sin: Math.sin,
          cos: Math.cos,
          tan: Math.tan,
          floor: Math.floor,
          ceil: Math.ceil,
          abs: Math.abs,
          pow: Math.pow,
          log: Math.log,
          exp: Math.exp
        },
        random: {
          random: Math.random,
          randint: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
          choice: (arr) => arr[Math.floor(Math.random() * arr.length)],
          shuffle: (arr) => {
            for(let i = arr.length - 1; i > 0; i--){
              const j = Math.floor(Math.random() * (i + 1));
              [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
          }
        },
        time: {
          time: () => Date.now() / 1000,
          sleep: (sec) => new Promise(resolve => setTimeout(resolve, sec * 1000))
        }
      }
    };
    
    // Built-in functions
    consoleVars.pythonContext.builtins = {
      print: (...args) => {
        const output = args.map(arg => pythonRepr(arg)).join(' ');
        appendToConsole(output);
      },
      len: (obj) => {
        if(Array.isArray(obj) || typeof obj === 'string') return obj.length;
        if(typeof obj === 'object' && obj !== null) return Object.keys(obj).length;
        throw new Error('object has no len()');
      },
      range: (start, stop, step = 1) => {
        if(stop === undefined) { stop = start; start = 0; }
        const result = [];
        for(let i = start; i < stop; i += step) result.push(i);
        return result;
      },
      sum: (arr) => arr.reduce((a, b) => a + b, 0),
      max: (...args) => Math.max(...args.flat()),
      min: (...args) => Math.min(...args.flat()),
      abs: Math.abs,
      int: (x) => parseInt(x, 10),
      float: parseFloat,
      str: (x) => String(x),
      bool: (x) => Boolean(x),
      list: (x) => Array.isArray(x) ? [...x] : [...x],
      type: (x) => {
        if(Array.isArray(x)) return 'list';
        return typeof x;
      }
    };
  }

  function executeLine(lines, startIndex){
    const line = lines[startIndex].trim();
    
    // Handle imports
    if(line.startsWith('import ') || line.startsWith('from ')){
      return handleImport(line, startIndex);
    }
    
    // Handle function definitions
    if(line.startsWith('def ')){
      return handleFunctionDef(lines, startIndex);
    }
    
    // Handle for loops
    if(line.startsWith('for ')){
      return handleForLoop(lines, startIndex);
    }
    
    // Handle while loops
    if(line.startsWith('while ')){
      return handleWhileLoop(lines, startIndex);
    }
    
    // Handle if statements
    if(line.startsWith('if ') || line.startsWith('elif ') || line.startsWith('else:')){
      return handleIfStatement(lines, startIndex);
    }
    
    // Handle assignments
    if(line.includes('=') && !line.includes('==') && !line.includes('!=') && !line.includes('>=') && !line.includes('<=')){
      handleAssignment(line);
      return startIndex + 1;
    }
    
    // Handle function calls and expressions
    const result = evaluateExpression(line);
    if(result !== undefined && result !== null && line.includes('print') === false){
      appendToConsole(pythonRepr(result));
    }
    
    return startIndex + 1;
  }

  function handleImport(line, startIndex){
    const importMatch = line.match(/^import\s+(\w+)$/);
    const fromMatch = line.match(/^from\s+(\w+)\s+import\s+(.+)$/);
    
    if(importMatch){
      const moduleName = importMatch[1];
      if(consoleVars.pythonContext.imports[moduleName]){
        consoleVars.pythonContext.variables[moduleName] = consoleVars.pythonContext.imports[moduleName];
      } else {
        throw new Error(`No module named '${moduleName}'`);
      }
    } else if(fromMatch){
      const moduleName = fromMatch[1];
      const imports = fromMatch[2].split(',').map(s => s.trim());
      
      if(consoleVars.pythonContext.imports[moduleName]){
        imports.forEach(imp => {
          if(imp === '*'){
            Object.assign(consoleVars.pythonContext.variables, consoleVars.pythonContext.imports[moduleName]);
          } else if(consoleVars.pythonContext.imports[moduleName][imp]){
            consoleVars.pythonContext.variables[imp] = consoleVars.pythonContext.imports[moduleName][imp];
          } else {
            throw new Error(`cannot import name '${imp}' from '${moduleName}'`);
          }
        });
      } else {
        throw new Error(`No module named '${moduleName}'`);
      }
    }
    
    return startIndex + 1;
  }

  function handleFunctionDef(lines, startIndex){
    const defLine = lines[startIndex];
    const match = defLine.match(/^def\s+(\w+)\s*\(([^)]*)\):\s*$/);
    if(!match) throw new Error('Invalid function definition syntax');
    
    const funcName = match[1];
    const params = match[2].split(',').map(p => p.trim()).filter(p => p);
    
    // Find function body
    let bodyStart = startIndex + 1;
    let bodyEnd = bodyStart;
    
    while(bodyEnd < lines.length && (lines[bodyEnd].match(/^\s+/) || lines[bodyEnd].trim() === '')){
      bodyEnd++;
    }
    
    const bodyLines = lines.slice(bodyStart, bodyEnd);
    
    // Create function
    consoleVars.pythonContext.functions[funcName] = {
      params: params,
      body: bodyLines
    };
    
    return bodyEnd;
  }

  function handleForLoop(lines, startIndex){
    const forLine = lines[startIndex];
    const match = forLine.match(/^for\s+(\w+)\s+in\s+(.+):\s*$/);
    if(!match) throw new Error('Invalid for loop syntax');
    
    const varName = match[1];
    const iterableExpr = match[2];
    const iterable = evaluateExpression(iterableExpr);
    
    if(!Array.isArray(iterable) && typeof iterable !== 'string'){
      throw new Error('Object is not iterable');
    }
    
    // Find loop body
    let bodyStart = startIndex + 1;
    let bodyEnd = bodyStart;
    
    while(bodyEnd < lines.length && (lines[bodyEnd].match(/^\s+/) || lines[bodyEnd].trim() === '')){
      bodyEnd++;
    }
    
    const bodyLines = lines.slice(bodyStart, bodyEnd);
    
    // Execute loop
    for(const item of iterable){
      consoleVars.pythonContext.variables[varName] = item;
      executeBlock(bodyLines);
    }
    
    return bodyEnd;
  }

  function handleWhileLoop(lines, startIndex){
    const whileLine = lines[startIndex];
    const match = whileLine.match(/^while\s+(.+):\s*$/);
    if(!match) throw new Error('Invalid while loop syntax');
    
    const condition = match[1];
    
    // Find loop body
    let bodyStart = startIndex + 1;
    let bodyEnd = bodyStart;
    
    while(bodyEnd < lines.length && (lines[bodyEnd].match(/^\s+/) || lines[bodyEnd].trim() === '')){
      bodyEnd++;
    }
    
    const bodyLines = lines.slice(bodyStart, bodyEnd);
    
    // Execute loop
    let iterations = 0;
    while(evaluateExpression(condition) && iterations < 1000){
      executeBlock(bodyLines);
      iterations++;
    }
    
    if(iterations >= 1000){
      throw new Error('Maximum loop iterations exceeded (1000)');
    }
    
    return bodyEnd;
  }

  function handleIfStatement(lines, startIndex){
    let currentIndex = startIndex;
    let executed = false;
    
    while(currentIndex < lines.length){
      const line = lines[currentIndex].trim();
      
      if(line.startsWith('if ') || line.startsWith('elif ')){
        const match = line.match(/^(if|elif)\s+(.+):\s*$/);
        if(!match) throw new Error('Invalid if/elif syntax');
        
        const condition = match[2];
        
        // Find block
        let bodyStart = currentIndex + 1;
        let bodyEnd = bodyStart;
        
        while(bodyEnd < lines.length && (lines[bodyEnd].match(/^\s+/) || lines[bodyEnd].trim() === '')){
          bodyEnd++;
        }
        
        if(!executed && evaluateExpression(condition)){
          executeBlock(lines.slice(bodyStart, bodyEnd));
          executed = true;
        }
        
        currentIndex = bodyEnd;
        
        // Check if next line is elif or else
        if(currentIndex < lines.length){
          const nextLine = lines[currentIndex].trim();
          if(nextLine.startsWith('elif ') || nextLine.startsWith('else:')){
            continue;
          }
        }
        break;
        
      } else if(line.startsWith('else:')){
        // Find block
        let bodyStart = currentIndex + 1;
        let bodyEnd = bodyStart;
        
        while(bodyEnd < lines.length && (lines[bodyEnd].match(/^\s+/) || lines[bodyEnd].trim() === '')){
          bodyEnd++;
        }
        
        if(!executed){
          executeBlock(lines.slice(bodyStart, bodyEnd));
        }
        
        currentIndex = bodyEnd;
        break;
      } else {
        break;
      }
    }
    
    return currentIndex;
  }

  function executeBlock(bodyLines){
    let i = 0;
    while(i < bodyLines.length){
      const line = bodyLines[i].replace(/^\s+/, ''); // Remove indentation
      if(line.trim()){
        i = executeLine([line], 0);
      } else {
        i++;
      }
    }
  }

  function handleAssignment(line){
    const parts = line.split('=');
    const varName = parts[0].trim();
    const expr = parts.slice(1).join('=').trim();
    
    if(!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)){
      throw new Error('Invalid variable name: ' + varName);
    }
    
    consoleVars.pythonContext.variables[varName] = evaluateExpression(expr);
  }

  function evaluateExpression(expr){
    expr = expr.trim();
    
    // Handle strings
    if((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))){
      return expr.slice(1, -1);
    }
    
    // Handle numbers
    if(/^-?\d+(\.\d+)?$/.test(expr)){
      return expr.includes('.') ? parseFloat(expr) : parseInt(expr, 10);
    }
    
    // Handle booleans
    if(expr === 'True') return true;
    if(expr === 'False') return false;
    if(expr === 'None') return null;
    
    // Handle lists
    if(expr.startsWith('[') && expr.endsWith(']')){
      const content = expr.slice(1, -1).trim();
      if(!content) return [];
      return content.split(',').map(item => evaluateExpression(item.trim()));
    }
    
    // Handle function calls, including dotted names like module.func()
    const funcMatch = expr.match(/^([a-zA-Z_][\w.]*)\s*\((.*)\)$/);
    if(funcMatch){
      const funcPath = funcMatch[1];
      const argsStr = funcMatch[2].trim();
      const args = argsStr ? argsStr.split(',').map(arg => evaluateExpression(arg.trim())) : [];
      
      // Built-in direct call
      if(consoleVars.pythonContext.builtins[funcPath]){
        return consoleVars.pythonContext.builtins[funcPath](...args);
      }
      
      // User-defined direct call
      if(consoleVars.pythonContext.functions[funcPath]){
        return callUserFunction(funcPath, args);
      }
      
      // Dotted path (module or object attribute call)
      if(funcPath.includes('.')){
        const callable = resolveNamePath(funcPath);
        if(typeof callable === 'function'){
          return callable(...args);
        }
        throw new Error(`'${funcPath}' is not callable`);
      }
      
      // Variables that are callable
      if(consoleVars.pythonContext.variables[funcPath] && typeof consoleVars.pythonContext.variables[funcPath] === 'function'){
        return consoleVars.pythonContext.variables[funcPath](...args);
      }
      
      throw new Error(`Function '${funcPath}' is not defined`);
    }
    
    // Handle variables
    if(/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(expr)){
      if(expr.includes('.')){
        return resolveNamePath(expr);
      }
      if(expr in consoleVars.pythonContext.variables){
        return consoleVars.pythonContext.variables[expr];
      }
      throw new Error(`Variable '${expr}' is not defined`);
    }
    
    // Handle arithmetic and comparisons
    return evaluateArithmetic(expr);
  }

  function callUserFunction(funcName, args){
    const func = consoleVars.pythonContext.functions[funcName];
    
    // Create new scope
    const oldVars = {...consoleVars.pythonContext.variables};
    
    // Bind parameters
    func.params.forEach((param, i) => {
      consoleVars.pythonContext.variables[param] = args[i];
    });
    
    try {
      executeBlock(func.body);
    } finally {
      // Restore scope
      consoleVars.pythonContext.variables = oldVars;
    }
    
    return null; // Functions return None by default
  }

  function evaluateArithmetic(expr){
    // Replace variables with their values
    let evalExpr = expr;
    for(const [varName, value] of Object.entries(consoleVars.pythonContext.variables)){
      if(typeof value === 'number' || typeof value === 'boolean'){
        evalExpr = evalExpr.replace(new RegExp(`\\b${varName}\\b`, 'g'), value);
      }
    }
    
    // Handle boolean operations
    evalExpr = evalExpr.replace(/\band\b/g, '&&');
    evalExpr = evalExpr.replace(/\bor\b/g, '||');
    evalExpr = evalExpr.replace(/\bnot\b/g, '!');
    
    // Handle comparison operators
    evalExpr = evalExpr.replace(/==/g, '===');
    evalExpr = evalExpr.replace(/!=/g, '!==');
    
    // Only allow safe expressions
    if(/^[\d\s+\-*/().><=!&|]+$/.test(evalExpr)){
      try {
        return Function(`"use strict"; return (${evalExpr})`)();
      } catch(e) {
        throw new Error(`Cannot evaluate expression: ${expr}`);
      }
    }
    
    throw new Error(`Cannot evaluate expression: ${expr}`);
  }

  function pythonRepr(obj){
    if(obj === null) return 'None';
    if(obj === true) return 'True';
    if(obj === false) return 'False';
    if(typeof obj === 'string') return obj;
    if(Array.isArray(obj)) return '[' + obj.map(pythonRepr).join(', ') + ']';
    return String(obj);
  }

  // Minigame finish button wiring (if present in DOM)
  const finishMinigameBtn = document.getElementById('finishMinigame');
  if(finishMinigameBtn){
    finishMinigameBtn.addEventListener('click', ()=>{
      if(minigameCheck && typeof minigameCheck === 'function'){
        const ok = !!minigameCheck();
        minigameComplete = ok;
        minigameFeedback.textContent = ok ? 'Mini-game complete!' : 'Not complete yet — keep trying!';
        minigameFeedback.className = 'feedback ' + (ok ? 'glow-green' : 'glow-red');
        if(ok){ window.World.addReward(8,4); }
        checkUnlock();
      }
    });
  }

  window.UI = { openPanel };
})();