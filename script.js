// ══ MODALS ══
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.modal-bg').forEach(bg=>bg.addEventListener('click',e=>{if(e.target===bg)bg.classList.remove('open');}));

// ══ TOAST ══
let toastT;
function toast(m){const el=document.getElementById('toast');el.textContent=m;el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),2500);}

// ══ KEYBOARD ══
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){deselectAll();cancelCrop();}
  if((e.key==='Delete'||e.key==='Backspace')&&selEl&&e.target.tagName!=='INPUT'&&e.target.tagName!=='TEXTAREA'){e.preventDefault();deleteSelected();}
  if(e.key==='ArrowLeft'&&document.getElementById('screen-viewer').classList.contains('active')) viewerPrev();
  if(e.key==='ArrowRight'&&document.getElementById('screen-viewer').classList.contains('active')) viewerNext();
});

// Add all remaining JavaScript functions from the original file here...
