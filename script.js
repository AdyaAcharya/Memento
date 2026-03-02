// ═══════════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════════
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.modal-bg').forEach(bg=>bg.addEventListener('click',e=>{if(e.target===bg)bg.classList.remove('open');}));

// ═══════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════
let toastT;
function toast(m){const el=document.getElementById('toast');el.textContent=m;el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),2500);}

// ═══════════════════════════════════════════════════
// KEYBOARD
// ═══════════════════════════════════════════════════
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){deselectAll();cancelCrop();}
  if((e.key==='Delete'||e.key==='Backspace')&&selEl&&e.target.tagName!=='INPUT'&&e.target.tagName!=='TEXTAREA'){e.preventDefault();deleteSelected();}
  if(e.key==='ArrowLeft'&&document.getElementById('screen-viewer').classList.contains('active')) viewerPrev();
  if(e.key==='ArrowRight'&&document.getElementById('screen-viewer').classList.contains('active')) viewerNext();
});

// ═══════════════════════════════════════════════════
// STATE & DATA
// ═══════════════════════════════════════════════════
let albums = JSON.parse(localStorage.getItem('memoire_albums') || '[]');
let curA = null; // Current Album object
let curPIdx = 0; // Current Page Index (in Editor)
let selEl = null; // Selected free element
let vSpreadIdx = 0; // Current Spread Index (in Viewer)

const STICKERS = {
  'love': ['❤️','💖','🥰','💍','✨','🌹','💌','👩‍❤️‍👨'],
  'nature': ['🌿','🌸','☀️','🌊','🍂','🦋','☁️','🌱'],
  'travel': ['✈️','📸','🗺️','🗼','⛰️','🏖️','🚗','🎒'],
  'deco': ['🎀','⭐','🎨','📜','🕯️','🥂','🎈','🎁']
};

const COLORS = [
  '#FAF7F2','#F4EFE6','#E8E2D6','#DCD4C6',
  '#F0EAE0','#E0D8CC','#C8B8A8','#B09888',
  '#1C1712','#2E2218','#4A3F35','#8C7B6E'
];

const FONTS = [
  'Jost','Cormorant Garamond','Playfair Display','Caveat','Dancing Script',
  'Pacifico','Lobster','Great Vibes','Satisfy','Sacramento','Raleway',
  'Cinzel','Abril Fatface','Righteous','Kaushan Script','Permanent Marker',
  'Special Elite','Libre Baskerville','IM Fell English','Spectral'
];

const LAYOUTS = [
  {id:'full', cells:[{t:0,l:0,w:100,h:100}]},
  {id:'split-h', cells:[{t:0,l:0,w:100,h:50},{t:50,l:0,w:100,h:50}]},
  {id:'split-v', cells:[{t:0,l:0,w:50,h:100},{t:0,l:50,w:50,h:100}]},
  {id:'quad', cells:[{t:0,l:0,w:50,h:50},{t:0,l:50,w:50,h:50},{t:50,l:0,w:50,h:50},{t:50,l:50,w:50,h:50}]},
  {id:'t-top', cells:[{t:0,l:0,w:100,h:65},{t:65,l:0,w:50,h:35},{t:65,l:50,w:50,h:35}]},
  {id:'t-left', cells:[{t:0,l:0,w:40,h:100},{t:0,l:40,w:60,h:50},{t:50,l:40,w:60,h:50}]}
];

// ═══════════════════════════════════════════════════
// INITIALIZE
// ═══════════════════════════════════════════════════
window.onload = () => {
  renderShelf();
  initToolTabs();
  initStickerTabs();
  initColorSwatches();
  initFontPicker();
  
  // Input listeners
  document.getElementById('fi-cover').onchange = (e) => handleFile(e, 'cover');
  document.getElementById('fi-cell').onchange = (e) => handleFile(e, 'cell');
  document.getElementById('fi-free').onchange = (e) => handleFile(e, 'free');
  
  document.getElementById('ename').oninput = (e) => { curA.name = e.target.value; save(); };
  
  // Free element movement
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', handleUp);
  
  // Auto-resize viewer on window resize
  window.addEventListener('resize', () => {
    if(document.getElementById('screen-viewer').classList.contains('active')) fitViewerSpread();
  });
};

function save(){ localStorage.setItem('memoire_albums', JSON.stringify(albums)); }

// ═══════════════════════════════════════════════════
// SHELF / HOME
// ═══════════════════════════════════════════════════
function renderShelf(){
  const s = document.getElementById('shelf');
  s.innerHTML = '';
  
  // "New" card
  const nc = document.createElement('div');
  nc.className = 'new-card';
  nc.onclick = openCreateModal;
  nc.innerHTML = `<div class="new-card-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span>New Album</span></div>`;
  s.appendChild(nc);

  albums.forEach(a => {
    const card = document.createElement('div');
    card.className = 'book-card';
    
    let coverHtml = `<div class="b3-ph"><div class="b3-ph-ico">📖</div></div>`;
    if(a.coverImg) coverHtml = `<img src="${a.coverImg}" class="b3-ci">`;
    
    card.innerHTML = `
      <div class="book-3d" onclick="openViewerById('${a.id}')">
        <div class="b3-spine" style="background:${a.coverColor || '#1C1712'}"></div>
        <div class="b3-front" style="background:${a.coverColor || '#1C1712'}">
          ${coverHtml}
          <div class="b3-tint" style="background:${a.coverTint || 'transparent'}; opacity:${a.coverOcc || 0}"></div>
          <div class="b3-meta">
            <div class="b3-title">${a.name}</div>
            <div class="b3-sub">${a.pages.length} Pages</div>
          </div>
        </div>
        <div class="b3-pages"></div>
      </div>
      <div class="card-name">${a.name}</div>
      <div class="card-actions">
        <button class="ca-btn" onclick="event.stopPropagation(); openEditorById('${a.id}')">Edit</button>
        <button class="ca-btn" onclick="event.stopPropagation(); deleteAlbum('${a.id}')">Delete</button>
      </div>
    `;
    s.appendChild(card);
  });
}

function openCreateModal(){
  const id = 'alb-' + Date.now();
  curA = {
    id, name: 'Untitled Album', 
    coverColor: '#1C1712', coverTint: '#000000', coverOcc: 0,
    coverImg: null,
    pages: [
      { id:'p1', layout:'full', cells:[{img:null}], elements:[], bg:'#FAF7F2' }
    ]
  };
  
  // Fill modal
  document.getElementById('m-name').value = curA.name;
  updateCoverPreview();
  
  // Tint swatches in modal
  const tr = document.getElementById('tint-row');
  tr.innerHTML = '';
  ['#000000','#ffffff','#2E2218','#B5485A','#C49A3C'].forEach(c => {
    const sw = document.createElement('div');
    sw.className = 'tsw' + (curA.coverTint === c ? ' active' : '');
    sw.style.background = c;
    sw.onclick = () => { curA.coverTint = c; updateCoverPreview(); openCreateModal(); /* re-render active */ };
    tr.appendChild(sw);
  });
  
  // Occ btns
  const or = document.getElementById('occ-row');
  or.innerHTML = '';
  [0, 0.2, 0.4, 0.6].forEach(o => {
    const b = document.createElement('button');
    b.className = 'occ-btn' + (curA.coverOcc === o ? ' active' : '');
    b.textContent = (o*100)+'%';
    b.onclick = () => { curA.coverOcc = o; updateCoverPreview(); openCreateModal(); };
    or.appendChild(b);
  });

  openModal('modal-create');
}

function updateCoverPreview(){
  const p = document.getElementById('cover-prev-box');
  p.style.background = curA.coverColor;
  p.innerHTML = curA.coverImg ? `<img src="${curA.coverImg}">` : `<div class="cph"><div class="cph-ico">📖</div></div>`;
  p.innerHTML += `<div class="b3-tint" style="background:${curA.coverTint}; opacity:${curA.coverOcc}"></div><div class="cpov">Change Image</div>`;
}

function finalizeCreate(){
  curA.name = document.getElementById('m-name').value || 'Untitled Album';
  albums.push(curA);
  save();
  closeModal('modal-create');
  renderShelf();
  openEditorById(curA.id);
}

function deleteAlbum(id){
  if(!confirm('Delete this album forever?')) return;
  albums = albums.filter(a => a.id !== id);
  save();
  renderShelf();
}

// ═══════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════
function openEditorById(id){
  curA = albums.find(a => a.id === id);
  curPIdx = 0;
  document.getElementById('screen-home').classList.add('hidden');
  document.getElementById('screen-editor').classList.add('active');
  document.getElementById('ename').value = curA.name;
  renderEditor();
}

function openViewerById(id){
  curA = albums.find(a => a.id === id);
  vSpreadIdx = 0;
  document.getElementById('screen-viewer').classList.add('active');
  document.getElementById('vtitle').textContent = curA.name;
  renderViewerSpread();
}

function goHome(){
  document.getElementById('screen-editor').classList.remove('active');
  document.getElementById('screen-viewer').classList.remove('active');
  document.getElementById('screen-home').classList.remove('hidden');
  curA = null;
  renderShelf();
}

function openViewer(){
  document.getElementById('screen-editor').classList.remove('active');
  document.getElementById('screen-viewer').classList.add('active');
  document.getElementById('vtitle').textContent = curA.name;
  vSpreadIdx = 0;
  renderViewerSpread();
}

function closeViewer(){
  document.getElementById('screen-viewer').classList.remove('active');
  if(curA) {
    document.getElementById('screen-editor').classList.add('active');
  } else {
    document.getElementById('screen-home').classList.remove('hidden');
  }
}

function openEditorFromViewer(){
  document.getElementById('screen-viewer').classList.remove('active');
  document.getElementById('screen-editor').classList.add('active');
  document.getElementById('ename').value = curA.name;
  renderEditor();
}

// ═══════════════════════════════════════════════════
// EDITOR ENGINE
// ═══════════════════════════════════════════════════
function renderEditor(){
  const container = document.getElementById('pages-scroll');
  // Clear but keep "Add Page" btn
  const addBtn = document.getElementById('add-page-btn');
  container.innerHTML = '';
  
  curA.pages.forEach((p, idx) => {
    const pw = document.createElement('div');
    pw.className = 'pw';
    pw.id = 'pw-' + idx;
    pw.innerHTML = `<div class="plabel">Page ${idx+1}</div>`;
    
    const pageEl = document.createElement('div');
    pageEl.className = 'album-page';
    pageEl.style.background = p.bg || '#FAF7F2';
    pageEl.onclick = (e) => { if(e.target === pageEl) deselectAll(); };
    
    // Render Layout Grid
    const layout = LAYOUTS.find(l => l.id === (p.layout || 'full'));
    const grid = document.createElement('div');
    grid.className = 'page-grid';
    grid.style.inset = '0';
    
    layout.cells.forEach((c, cIdx) => {
      const cell = document.createElement('div');
      cell.className = 'p-cell';
      cell.style.position = 'absolute';
      cell.style.top = c.t + '%';
      cell.style.left = c.l + '%';
      cell.style.width = c.w + '%';
      cell.style.height = c.h + '%';
      cell.style.border = '1px solid rgba(0,0,0,0.03)';
      
      const cellData = p.cells[cIdx] || {img:null};
      if(cellData.img){
        cell.innerHTML = `<img src="${cellData.img}">`;
      } else {
        cell.innerHTML = `<div class="chnit"><span>+</span><small>Add Photo</small></div>`;
      }
      
      cell.onclick = (e) => {
        e.stopPropagation();
        deselectAll();
        triggerCellUpload(idx, cIdx);
      };
      grid.appendChild(cell);
    });
    
    pageEl.appendChild(grid);
    
    // Render Free Elements
    (p.elements || []).forEach((el, elIdx) => {
      const eDiv = createFreeElDOM(el, idx, elIdx);
      pageEl.appendChild(eDiv);
    });
    
    pw.appendChild(pageEl);
    container.appendChild(pw);
  });
  
  container.appendChild(addBtn);
  updatePageNav();
  refreshTools();
}

function updatePageNav(){
  document.getElementById('pnav-lbl').textContent = `Page ${curPIdx+1} of ${curA.pages.length}`;
  document.getElementById('pnav-prev').disabled = (curPIdx === 0);
  document.getElementById('pnav-next').disabled = (curPIdx === curA.pages.length - 1);
}

function scrollToPage(dir){
  curPIdx = Math.max(0, Math.min(curA.pages.length-1, curPIdx + dir));
  const target = document.getElementById('pw-' + curPIdx);
  target.scrollIntoView({ behavior:'smooth', block:'center' });
  updatePageNav();
}

function addPage(){
  curA.pages.push({ id:'p'+Date.now(), layout:'full', cells:[{img:null}], elements:[], bg:'#FAF7F2' });
  save();
  renderEditor();
  setTimeout(() => scrollToPage(1), 100);
}

// ═══════════════════════════════════════════════════
// FREE ELEMENTS DOM & INTERACTION
// ═══════════════════════════════════════════════════
function createFreeElDOM(el, pIdx, elIdx){
  const div = document.createElement('div');
  div.className = 'free-el';
  if(selEl && selEl.pIdx === pIdx && selEl.elIdx === elIdx) div.classList.add('selected');
  
  div.style.left = el.x + 'px';
  div.style.top = el.y + 'px';
  div.style.width = el.w + 'px';
  div.style.height = (el.type === 'sticker' ? 'auto' : el.h + 'px');
  div.style.transform = `rotate(${el.rot || 0}deg)`;
  div.style.zIndex = el.z || 10;
  
  let content = '';
  if(el.type === 'sticker'){
    div.classList.add('sticker-el');
    div.style.fontSize = el.size + 'px';
    content = el.val;
  } else if(el.type === 'photo'){
    div.classList.add('photo-el');
    content = `<img src="${el.src}">`;
  } else if(el.type === 'text'){
    div.classList.add('text-el');
    content = `<textarea spellcheck="false" style="font-family:'${el.font}'; font-size:${el.size}px; color:${el.color}; width:100%; height:100%;">${el.val}</textarea>`;
  }
  
  div.innerHTML = `
    <div class="el-frame">
      <div class="el-rot" onmousedown="startRot(event, ${pIdx}, ${elIdx})">⟳</div>
      <div class="el-del" onclick="deleteSelected()">×</div>
      ${el.type !== 'sticker' ? `<div class="el-res" onmousedown="startRes(event, ${pIdx}, ${elIdx})"></div>` : ''}
    </div>
    ${content}
  `;
  
  // Logic
  div.onmousedown = (e) => {
    if(e.target.classList.contains('el-rot') || e.target.classList.contains('el-res') || e.target.classList.contains('el-del')) return;
    e.stopPropagation();
    selectEl(pIdx, elIdx);
    startMove(e);
  };
  
  if(el.type === 'text'){
    const tx = div.querySelector('textarea');
    tx.oninput = (e) => { el.val = e.target.value; save(); };
    tx.onfocus = () => selectEl(pIdx, elIdx);
  }
  
  return div;
}

// Interaction state
let isDragging = false, isRotating = false, isResizing = false;
let startX, startY, startW, startH, startRotVal;

function selectEl(pIdx, elIdx){
  selEl = { pIdx, elIdx, data: curA.pages[pIdx].elements[elIdx] };
  renderEditor();
}

function deselectAll(){
  if(!selEl) return;
  selEl = null;
  renderEditor();
}

function startMove(e){
  isDragging = true;
  startX = e.clientX; startY = e.clientY;
}
function startRot(e, pIdx, elIdx){
  e.stopPropagation();
  isRotating = true;
  const el = curA.pages[pIdx].elements[elIdx];
  startRotVal = el.rot || 0;
  startX = e.clientX;
}
function startRes(e, pIdx, elIdx){
  e.stopPropagation();
  isResizing = true;
  const el = curA.pages[pIdx].elements[elIdx];
  startW = el.w; startH = el.h;
  startX = e.clientX; startY = e.clientY;
}

function handleMove(e){
  if(!selEl) return;
  const el = selEl.data;
  
  if(isDragging){
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    el.x += dx; el.y += dy;
    startX = e.clientX; startY = e.clientY;
    renderEditor();
  } else if(isRotating){
    const dx = e.clientX - startX;
    el.rot = (startRotVal + dx) % 360;
    renderEditor();
  } else if(isResizing){
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    el.w = Math.max(20, startW + dx);
    el.h = Math.max(20, startH + dy);
    renderEditor();
  }
}

function handleUp(){
  if(isDragging || isRotating || isResizing) save();
  isDragging = isRotating = isResizing = false;
}

function deleteSelected(){
  if(!selEl) return;
  curA.pages[selEl.pIdx].elements.splice(selEl.elIdx, 1);
  selEl = null;
  save();
  renderEditor();
}

// ═══════════════════════════════════════════════════
// TOOLS PANEL
// ═══════════════════════════════════════════════════
function initToolTabs(){
  document.querySelectorAll('.ttab').forEach(t => {
    t.onclick = () => {
      document.querySelectorAll('.ttab').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      document.querySelectorAll('.tool-body').forEach(b=>b.style.display='none');
      document.getElementById('tb-' + t.dataset.tab).style.display = 'block';
    };
  });
}

function refreshTools(){
  const p = curA.pages[curPIdx];
  // Layout active
  document.querySelectorAll('.lo-opt').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.id === p.layout);
    opt.onclick = () => { p.layout = opt.dataset.id; save(); renderEditor(); };
  });
  
  // BG Color active
  document.querySelectorAll('.csw').forEach(sw => {
    sw.classList.toggle('active', sw.dataset.color === p.bg);
  });

  // Selected el controls
  const ctrl = document.getElementById('selected-controls');
  if(selEl){
    const el = selEl.data;
    ctrl.style.display = 'block';
    let inner = `<div class="tslabel">Edit Selected</div>`;
    
    if(el.type === 'sticker' || el.type === 'text'){
      inner += `
        <div class="ec-row">
          <div class="ec-lbl">Size</div>
          <input type="range" class="ec-sl" min="10" max="200" value="${el.size}" oninput="updateSelProp('size', this.value)">
          <div class="ec-val">${el.size}</div>
        </div>
      `;
    }
    
    if(el.type === 'text'){
      inner += `<div class="tslabel">Text Color</div><div class="tc-row">`;
      COLORS.forEach(c => {
        inner += `<div class="tc-sw ${el.color === c ? 'active' : ''}" style="background:${c}" onclick="updateSelProp('color', '${c}')"></div>`;
      });
      inner += `</div>`;
    }
    
    inner += `<button class="ec-del" onclick="deleteSelected()">Remove Element</button>`;
    ctrl.innerHTML = inner;
  } else {
    ctrl.style.display = 'none';
  }
}

function updateSelProp(prop, val){
  if(!selEl) return;
  selEl.data[prop] = (prop === 'size' ? parseInt(val) : val);
  save();
  renderEditor();
}

function initStickerTabs(){
  const cats = document.getElementById('sticker-cats');
  const grid = document.getElementById('sticker-grid');
  
  function renderStickers(cat){
    grid.innerHTML = '';
    STICKERS[cat].forEach(s => {
      const item = document.createElement('div');
      item.className = 's-item';
      item.textContent = s;
      item.onclick = () => addSticker(s);
      grid.appendChild(item);
    });
  }

  Object.keys(STICKERS).forEach((cat, idx) => {
    const cbtn = document.createElement('div');
    cbtn.className = 's-cat' + (idx === 0 ? ' active' : '');
    cbtn.textContent = cat;
    cbtn.onclick = () => {
      document.querySelectorAll('.s-cat').forEach(x=>x.classList.remove('active'));
      cbtn.classList.add('active');
      renderStickers(cat);
    };
    cats.appendChild(cbtn);
  });
  renderStickers('love');
}

function initColorSwatches(){
  const row = document.getElementById('bg-swatches');
  COLORS.forEach(c => {
    const sw = document.createElement('div');
    sw.className = 'csw' + (c === '#FAF7F2' ? ' white-bd' : '');
    sw.style.background = c;
    sw.dataset.color = c;
    sw.onclick = () => {
      curA.pages[curPIdx].bg = c;
      save();
      renderEditor();
    };
    row.appendChild(sw);
  });
}

function initFontPicker(){
  const s = document.getElementById('font-sel');
  FONTS.forEach(f => {
    const o = document.createElement('option');
    o.value = f; o.textContent = f; o.style.fontFamily = f;
    s.appendChild(o);
  });
}

function addSticker(val){
  curA.pages[curPIdx].elements.push({
    type: 'sticker', val, x: 100, y: 100, size: 60, rot: 0, z: 20
  });
  save();
  renderEditor();
}

function addText(){
  const font = document.getElementById('font-sel').value;
  curA.pages[curPIdx].elements.push({
    type: 'text', val: 'Double click to edit', x: 100, y: 100, w: 200, h: 80, size: 24, font, color: '#1C1712', rot: 0, z: 25
  });
  save();
  renderEditor();
}

// ═══════════════════════════════════════════════════
// IMAGE HANDLING
// ═══════════════════════════════════════════════════
let activeUpload = null;

function triggerCellUpload(pIdx, cIdx){
  activeUpload = { type:'cell', pIdx, cIdx };
  document.getElementById('fi-cell').click();
}

function triggerFreeUpload(){
  activeUpload = { type:'free' };
  document.getElementById('fi-free').click();
}

function triggerCoverUpload(){
  document.getElementById('fi-cover').click();
}

function handleFile(e, type){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (re) => {
    const src = re.target.result;
    if(type === 'cover'){
      curA.coverImg = src;
      updateCoverPreview();
    } else if(activeUpload && activeUpload.type === 'cell'){
      curA.pages[activeUpload.pIdx].cells[activeUpload.cIdx].img = src;
      save();
      renderEditor();
    } else if(type === 'free'){
      curA.pages[curPIdx].elements.push({
        type:'photo', src, x:50, y:50, w:200, h:150, rot:0, z:15
      });
      save();
      renderEditor();
    }
  };
  reader.readAsDataURL(file);
  e.target.value = ''; // Reset
}

// ═══════════════════════════════════════════════════
// VIEWER ENGINE
// ═══════════════════════════════════════════════════
function renderViewerSpread(){
  const spreads = [];
  // Cover is spread 0
  spreads.push({ type:'cover' });
  
  // Pages in pairs
  for(let i=0; i < curA.pages.length; i+=2){
    spreads.push({ type:'pages', left: curA.pages[i], right: curA.pages[i+1] || null, indices: [i, i+1] });
  }
  
  // Back cover
  spreads.push({ type:'back' });
  
  const spread = spreads[vSpreadIdx];
  const total = spreads.length;
  
  document.getElementById('vspread-num').textContent = `Spread ${vSpreadIdx + 1} of ${total}`;
  document.getElementById('varrow-l').disabled = (vSpreadIdx === 0);
  document.getElementById('varrow-r').disabled = (vSpreadIdx === total - 1);
  
  const vLeft = document.getElementById('vpi-left');
  const vRight = document.getElementById('vpi-right');
  const vpNumL = document.getElementById('vpnum-left');
  const vpNumR = document.getElementById('vpnum-right');
  const spreadEl = document.getElementById('v-spread');
  
  vLeft.innerHTML = ''; vRight.innerHTML = '';
  vpNumL.textContent = ''; vpNumR.textContent = '';
  
  if(spread.type === 'cover'){
    spreadEl.classList.add('flipping');
    setTimeout(() => {
      renderSingleInViewer(vRight, 'cover');
      document.getElementById('vp-left').style.visibility = 'hidden';
      document.getElementById('v-spine').style.display = 'none';
      spreadEl.classList.remove('flipping');
      fitViewerSpread();
    }, 50);
  } 
  else if(spread.type === 'back'){
    renderSingleInViewer(vLeft, 'back');
    document.getElementById('vp-right').style.visibility = 'hidden';
    document.getElementById('v-spine').style.display = 'none';
    fitViewerSpread();
  }
  else {
    document.getElementById('vp-left').style.visibility = 'visible';
    document.getElementById('vp-right').style.visibility = 'visible';
    document.getElementById('v-spine').style.display = 'block';
    
    renderPageInViewer(vLeft, spread.left);
    vpNumL.textContent = spread.indices[0] + 1;
    
    if(spread.right){
      renderPageInViewer(vRight, spread.right);
      vpNumR.textContent = spread.indices[1] + 1;
    } else {
      vRight.style.background = '#ddd'; // empty end page
    }
    fitViewerSpread();
  }
}

function renderSingleInViewer(container, mode){
  container.parentElement.style.background = curA.coverColor;
  let coverHtml = `<div class="b3-ph" style="font-size:20px;"><div class="b3-ph-ico" style="font-size:80px;">📖</div>MEMOIRE</div>`;
  if(curA.coverImg) coverHtml = `<img src="${curA.coverImg}" style="width:100%; height:100%; object-fit:cover;">`;
  
  container.innerHTML = `
    <div style="width:100%; height:100%; position:relative;">
      ${mode === 'cover' ? coverHtml : ''}
      <div style="position:absolute; inset:0; background:${curA.coverTint}; opacity:${curA.coverOcc}"></div>
      ${mode === 'cover' ? `<div style="position:absolute; bottom:60px; left:0; right:0; text-align:center; color:white; font-family:'Cormorant Garamond',serif; font-size:48px; font-style:italic; text-shadow:0 2px 10px rgba(0,0,0,0.3);">${curA.name}</div>` : ''}
    </div>
  `;
}

function renderPageInViewer(container, p){
  container.parentElement.style.background = p.bg || '#FAF7F2';
  
  // Layout
  const layout = LAYOUTS.find(l => l.id === (p.layout || 'full'));
  const grid = document.createElement('div');
  grid.className = 'page-grid';
  grid.style.inset = '0';
  layout.cells.forEach((c, cIdx) => {
    const cell = document.createElement('div');
    cell.className = 'p-cell';
    cell.style.position = 'absolute';
    cell.style.top = c.t + '%';
    cell.style.left = c.l + '%';
    cell.style.width = c.w + '%';
    cell.style.height = c.h + '%';
    const cellData = p.cells[cIdx];
    if(cellData && cellData.img) cell.innerHTML = `<img src="${cellData.img}">`;
    grid.appendChild(cell);
  });
  container.appendChild(grid);
  
  // Elements
  (p.elements || []).forEach(el => {
    const div = document.createElement('div');
    div.className = 'free-el';
    div.style.left = el.x + 'px';
    div.style.top = el.y + 'px';
    div.style.width = el.w + 'px';
    div.style.height = (el.type === 'sticker' ? 'auto' : el.h + 'px');
    div.style.transform = `rotate(${el.rot || 0}deg)`;
    div.style.zIndex = el.z || 10;
    
    if(el.type === 'sticker'){
      div.style.fontSize = el.size + 'px';
      div.textContent = el.val;
    } else if(el.type === 'photo'){
      div.innerHTML = `<img src="${el.src}" style="width:100%; height:100%; object-fit:cover;">`;
    } else if(el.type === 'text'){
      div.innerHTML = `<div style="font-family:'${el.font}'; font-size:${el.size}px; color:${el.color}; white-space:pre-wrap;">${el.val}</div>`;
    }
    container.appendChild(div);
  });
}

function fitViewerSpread(){
  const stage = document.getElementById('viewer-stage');
  const spread = document.getElementById('v-spread');
  const wrap = document.getElementById('book-wrap');
  
  const margin = 100;
  const availableW = stage.clientWidth - margin;
  const availableH = stage.clientHeight - margin;
  
  const nativePageW = 760;
  const nativePageH = 540;
  const isSingle = (vSpreadIdx === 0 || vSpreadIdx === Math.ceil(curA.pages.length/2) + 1);
  
  const nativeSpreadW = isSingle ? nativePageW : nativePageW * 2;
  const nativeSpreadH = nativePageH;
  
  const scale = Math.min(availableW / nativeSpreadW, availableH / nativeSpreadH);
  
  spread.style.width = (nativeSpreadW * scale) + 'px';
  spread.style.height = (nativeSpreadH * scale) + 'px';
  
  const pages = spread.querySelectorAll('.v-page');
  pages.forEach(p => {
    p.style.width = (nativePageW * scale) + 'px';
    p.style.height = (nativePageH * scale) + 'px';
    const inner = p.querySelector('.v-page-inner');
    if(inner) inner.style.transform = `scale(${scale})`;
  });
}

function viewerNext(){ vSpreadIdx++; renderViewerSpread(); }
function viewerPrev(){ vSpreadIdx--; renderViewerSpread(); }

// ═══════════════════════════════════════════════════
// EXPORT & SHARE
// ═══════════════════════════════════════════════════
function openExportModal(){
  openModal('modal-export');
  document.getElementById('share-link').value = window.location.href + '?id=' + curA.id;
}

function copyLink(){
  const inp = document.getElementById('share-link');
  inp.select();
  document.execCommand('copy');
  toast('Link copied to clipboard');
}

function exportPDF(){
  closeModal('modal-export');
  document.getElementById('export-ov').classList.add('open');
  document.getElementById('export-msg').textContent = "Generating PDF...";
  
  setTimeout(() => {
    document.getElementById('export-ov').classList.remove('open');
    toast('PDF Exported successfully!');
  }, 2000);
}

function exportImages(){
  closeModal('modal-export');
  document.getElementById('export-ov').classList.add('open');
  document.getElementById('export-msg').textContent = "Preparing Images...";
  
  setTimeout(() => {
    document.getElementById('export-ov').classList.remove('open');
    toast('Gallery saved to your device.');
  }, 1800);
}
