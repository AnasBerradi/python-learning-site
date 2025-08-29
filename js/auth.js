(function(){
  const STORAGE_CURRENT = 'pp_current_user';
  const STORAGE_PREFIX = 'pp_progress:';

  function readJSON(key, fallback=null){
    try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }catch(_){ return fallback; }
  }
  function writeJSON(key, val){
    try{ localStorage.setItem(key, JSON.stringify(val)); }catch(_){ /* ignore */ }
  }
  function remove(key){ try{ localStorage.removeItem(key); }catch(_){ }
  }

  let currentUser = readJSON(STORAGE_CURRENT, null);

  function getUser(){ return currentUser; }

  function register({name, email, password}){
    if(!email || !password){ throw new Error('Email and password are required'); }
    // In a real app, send to backend. Here we just store current user locally.
    currentUser = { name: name || email.split('@')[0], email };
    writeJSON(STORAGE_CURRENT, currentUser);
    return currentUser;
  }

  function login({email, password}){
    if(!email || !password){ throw new Error('Email and password are required'); }
    // No verification in demo; assume success
    currentUser = { name: email.split('@')[0], email };
    writeJSON(STORAGE_CURRENT, currentUser);
    return currentUser;
  }

  function logout(){
    currentUser = null;
    remove(STORAGE_CURRENT);
  }

  function progressKey(){
    if(!currentUser) return null;
    return STORAGE_PREFIX + currentUser.email;
  }

  function saveProgress(progress){
    const key = progressKey();
    if(!key) return; // not logged in
    writeJSON(key, progress || {});
  }

  function loadProgress(){
    const key = progressKey();
    if(!key) return null;
    return readJSON(key, null);
  }

  function applyProgressToWorld(){
    if(!window.World) return;
    const data = loadProgress();
    if(data){
      try{ window.World.importProgress(data); }catch(_){ }
    }
  }

  // Auto-apply saved progress when the learning world is open and a user is signed-in
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{
      if(getUser() && window.World){ applyProgressToWorld(); }
    });
  } else {
    if(getUser() && window.World){ applyProgressToWorld(); }
  }

  window.Auth = {
    getUser,
    register,
    login,
    logout,
    saveProgress,
    loadProgress,
    applyProgressToWorld,
  };
})();