/* ══════════════════════════════════════════
   Engineering Physiology Portfolio — app.js
   Open access — no authentication required
══════════════════════════════════════════ */

/* ════════════════════════════════════════
   DATA LAYER  (localStorage)
════════════════════════════════════════ */
const DB    = 'physio_portfolio';
const getA  = () => { try { return JSON.parse(localStorage.getItem(DB)) || []; } catch { return []; } };
const saveA = d => localStorage.setItem(DB, JSON.stringify(d));
const addA  = a => {
  const arr = getA();
  a.id        = Date.now();
  a.createdAt = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  arr.push(a);
  saveA(arr);
  return a;
};
const delA = id => saveA(getA().filter(a => a.id !== id));

/* ════════════════════════════════════════
   ROUTER
════════════════════════════════════════ */
const PAGES = ['home', 'about', 'assignments', 'projects', 'gallery', 'contact', 'upload'];

function nav(p) {
  PAGES.forEach(id => {
    document.getElementById('page-' + id).classList.toggle('active', id === p);
  });
  document.querySelectorAll('nav a').forEach((a, i) => {
    a.classList.toggle('active', PAGES[i] === p);
  });
  window.scrollTo(0, 0);
  if (p === 'home')        document.getElementById('statCount').textContent = getA().length;
  if (p === 'assignments') renderAsgn(getA());
  if (p === 'projects')    renderProj();
  if (p === 'gallery')     renderGal();
}

/* ════════════════════════════════════════
   TOAST
════════════════════════════════════════ */
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type}`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

/* ════════════════════════════════════════
   ASSIGNMENTS RENDER
════════════════════════════════════════ */
const EMOJI = { report: '📄', presentation: '📊', project: '🔬', other: '📁' };
let curFilter = 'all';

function renderAsgn(items) {
  const g = document.getElementById('asgnGrid');
  if (!items.length) {
    g.innerHTML = `<div class="empty">
      <span class="ei">📂</span>
      <h3>No assignments yet</h3>
      <p>Upload your first assignment using the Upload page.</p>
      <button class="btn btn-grad" onclick="nav('upload')">Go to Upload</button>
    </div>`;
    return;
  }
  g.innerHTML = items.map(a => {
    const img = a.images && a.images.length
      ? `<img src="${a.images[0]}" alt="${a.title}" loading="lazy">`
      : `<div class="asgn-placeholder">${EMOJI[a.category] || '📋'}</div>`;
    return `<div class="asgn-card" data-cat="${a.category || 'other'}">
      ${img}
      <div class="asgn-body">
        <span class="tag">${a.category || 'other'}</span>
        <h3>${a.title}</h3>
        <p>${a.description || 'No description provided.'}</p>
        <div class="asgn-actions">
          <button class="btn-view2" onclick="openMod(${a.id})">View Details</button>
          <button class="btn-del"   onclick="handleDel(${a.id})">Delete</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function filterA(btn, cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  curFilter = cat;
  const filtered = cat === 'all' ? getA() : getA().filter(a => a.category === cat);
  renderAsgn(filtered);
}

function handleDel(id) {
  if (!confirm('Delete this assignment?')) return;
  delA(id);
  const filtered = curFilter === 'all' ? getA() : getA().filter(a => a.category === curFilter);
  renderAsgn(filtered);
  toast('Assignment deleted.');
}

function renderProj() {
  const p = getA().filter(a => a.category === 'project');
  const g = document.getElementById('projGrid');
  if (!p.length) {
    g.innerHTML = `<div class="empty">
      <span class="ei">🔬</span>
      <h3>No projects yet</h3>
      <p>Upload an assignment with category "Project".</p>
      <button class="btn btn-grad" onclick="nav('upload')">Add Project</button>
    </div>`;
    return;
  }
  g.innerHTML = p.map(a => {
    const img = a.images && a.images.length
      ? `<img src="${a.images[0]}" alt="${a.title}">`
      : `<div class="asgn-placeholder">🔬</div>`;
    return `<div class="asgn-card">
      ${img}
      <div class="asgn-body">
        <span class="tag">project</span>
        <h3>${a.title}</h3>
        <p>${a.description || ''}</p>
        <div class="asgn-actions">
          <button class="btn-view2" onclick="openMod(${a.id})">View Details</button>
          <button class="btn-del"   onclick="handleDel(${a.id})">Delete</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ════════════════════════════════════════
   GALLERY
════════════════════════════════════════ */
function renderGal() {
  const imgs = [];
  getA().forEach(a => { if (a.images && a.images.length) a.images.forEach(s => imgs.push({ src: s, title: a.title })); });
  const g = document.getElementById('galGrid');
  if (!imgs.length) {
    g.innerHTML = `<div class="empty" style="grid-column:1/-1">
      <span class="ei">🖼️</span>
      <h3>No images yet</h3>
      <p>Upload assignments with images and they'll appear here.</p>
      <button class="btn btn-grad" onclick="nav('upload')">Upload Now</button>
    </div>`;
    return;
  }
  g.innerHTML = imgs.map(im => `
    <div class="gal-item" onclick="openLb('${im.src}')">
      <img src="${im.src}" alt="${im.title}" loading="lazy">
      <div class="gal-lbl">${im.title}</div>
    </div>`).join('');
}

function openLb(src) { document.getElementById('lbImg').src = src; document.getElementById('lb').classList.add('open'); }
function closeLb()   { document.getElementById('lb').classList.remove('open'); }

/* ════════════════════════════════════════
   DETAIL MODAL
════════════════════════════════════════ */
function openMod(id) {
  const a = getA().find(x => x.id === id);
  if (!a) return;
  document.getElementById('mTitle').textContent = a.title;
  document.getElementById('mCat').textContent   = `${EMOJI[a.category] || '📋'} ${a.category || 'Other'} · Added ${a.createdAt}`;
  document.getElementById('mText').textContent  = a.description || '';
  document.getElementById('mImgs').innerHTML    = a.images && a.images.length
    ? a.images.map(s => `<img src="${s}" alt="" onclick="openLb('${s}')">`).join('') : '';
  document.getElementById('mFiles').innerHTML   = a.files && a.files.length
    ? a.files.map(f => `<a class="modal-file" href="${f.data}" download="${f.name}">
        <span>📎</span><span>${f.name}</span>
        <span style="margin-left:auto;font-size:.76rem;color:var(--text-dim)">${f.size}</span>
      </a>`).join('') : '';
  document.getElementById('mMeta').innerHTML = `
    <span>📅 ${a.createdAt}</span>
    ${a.images ? `<span>🖼️ ${a.images.length} image(s)</span>` : ''}
    ${a.files  ? `<span>📎 ${a.files.length} file(s)</span>`   : ''}`;
  document.getElementById('detailModal').classList.add('open');
}

function closeMod() { document.getElementById('detailModal').classList.remove('open'); }

document.getElementById('detailModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeMod();
});

/* ════════════════════════════════════════
   TABS
════════════════════════════════════════ */
function switchTab(btn, id) {
  btn.closest('.tabs').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.upload-wrap > .tab-pane').forEach(p => {
    p.classList.toggle('active', p.id === id);
  });
  if (id === 'tab-manage') renderMgCards();
}

function switchImgTab(btn, id) {
  btn.closest('.tabs').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#itab-file, #itab-cam').forEach(p => p.classList.toggle('active', p.id === id));
}

/* ════════════════════════════════════════
   UPLOAD STATE
════════════════════════════════════════ */
let upImages    = [];
let capImages   = [];
let attachFiles = [];
let camStream   = null;

const allImgs = () => [...upImages, ...capImages];

function updateDots() {
  const v = document.getElementById('aTitle').value.trim().length > 0;
  document.getElementById('tCt').textContent = document.getElementById('aTitle').value.length;
  document.getElementById('d1').className = 'sdot' + (v ? ' done' : ' act');
  document.getElementById('d2').className = 'sdot' + (v ? ' act' : '');
}

/* Image file input */
document.getElementById('imgInput').addEventListener('change', function () {
  Array.from(this.files).forEach(f => {
    const r = new FileReader();
    r.onload = e => { upImages.push(e.target.result); renderPrevGrid(); };
    r.readAsDataURL(f);
  });
  this.value = '';
});

/* Image drag-and-drop */
const iz = document.getElementById('imgZone');
iz.addEventListener('dragover',  e => { e.preventDefault(); iz.classList.add('dv'); });
iz.addEventListener('dragleave', ()  => iz.classList.remove('dv'));
iz.addEventListener('drop', e => {
  e.preventDefault(); iz.classList.remove('dv');
  Array.from(e.dataTransfer.files)
    .filter(f => f.type.startsWith('image/'))
    .forEach(f => {
      const r = new FileReader();
      r.onload = ev => { upImages.push(ev.target.result); renderPrevGrid(); };
      r.readAsDataURL(f);
    });
});

function renderPrevGrid() {
  const imgs = allImgs();
  document.getElementById('prevGrid').innerHTML = imgs.map((s, i) => `
    <div class="prev-item">
      <img src="${s}">
      <button class="rx" onclick="rmImg(${i})">✕</button>
    </div>`).join('');
  document.getElementById('d2').className = 'sdot' + (imgs.length ? ' done' : ' act');
  document.getElementById('d3').className = 'sdot' + (imgs.length ? ' act'  : '');
}

function rmImg(i) {
  const all = allImgs();
  all.splice(i, 1);
  upImages  = all;
  capImages = [];
  renderPrevGrid();
}

/* ── CAMERA ── */
async function startCam() {
  try {
    camStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
    });
    document.getElementById('camVid').srcObject    = camStream;
    document.getElementById('btnCapture').disabled = false;
    document.getElementById('btnStop').disabled    = false;
    document.getElementById('btnStart').disabled   = true;
    document.getElementById('camSt').textContent   = '🔴 Live';
  } catch {
    toast('Camera access denied or unavailable.', 'error');
  }
}

function capPhoto() {
  const v = document.getElementById('camVid');
  const c = document.getElementById('capCanvas');
  c.width  = v.videoWidth  || 640;
  c.height = v.videoHeight || 480;
  c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
  const d = c.toDataURL('image/jpeg', .88);
  capImages.push(d);
  renderPrevGrid();
  const p = document.getElementById('capPrev');
  p.classList.add('has');
  const img = document.createElement('img');
  img.src       = d;
  img.className = 'cap-img';
  p.appendChild(img);
  toast('📸 Photo captured!');
}

function stopCam() {
  if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; }
  document.getElementById('camVid').srcObject    = null;
  document.getElementById('btnCapture').disabled = true;
  document.getElementById('btnStop').disabled    = true;
  document.getElementById('btnStart').disabled   = false;
  document.getElementById('camSt').textContent   = 'Camera off';
}

/* ── DOC FILES ── */
document.getElementById('docInput').addEventListener('change', function () {
  Array.from(this.files).forEach(readDoc);
  this.value = '';
});

const dz = document.getElementById('docZone');
dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('dv'); });
dz.addEventListener('dragleave', ()  => dz.classList.remove('dv'));
dz.addEventListener('drop', e => {
  e.preventDefault(); dz.classList.remove('dv');
  Array.from(e.dataTransfer.files).forEach(readDoc);
});

function readDoc(f) {
  if (f.size > 10 * 1024 * 1024) { toast(`${f.name} exceeds 10 MB — skipped.`, 'error'); return; }
  const r = new FileReader();
  r.onload = e => { attachFiles.push({ name: f.name, size: fmtSz(f.size), data: e.target.result }); renderDocList(); };
  r.readAsDataURL(f);
}

function fmtSz(b) {
  if (b < 1024)    return b + 'B';
  if (b < 1048576) return (b / 1024).toFixed(1) + 'KB';
  return (b / 1048576).toFixed(1) + 'MB';
}

const FI    = { pdf: '📕', doc: '📘', docx: '📘', ppt: '📙', pptx: '📙', xlsx: '📗', xls: '📗', txt: '📄' };
const fIcon = n => (FI[n.split('.').pop().toLowerCase()] || '📎');

function renderDocList() {
  document.getElementById('docList').innerHTML = attachFiles.map((f, i) => `
    <div class="file-item">
      <span>${fIcon(f.name)}</span>
      <span class="fn">${f.name}</span>
      <span class="fs">${f.size}</span>
      <button class="rf" onclick="rmDoc(${i})">🗑</button>
    </div>`).join('');
}

function rmDoc(i) { attachFiles.splice(i, 1); renderDocList(); }

/* ── SAVE ASSIGNMENT ── */
function saveAsgn() {
  const t = document.getElementById('aTitle').value.trim();
  if (!t) { toast('Please enter a title.', 'error'); document.getElementById('aTitle').focus(); return; }

  addA({
    title:       t,
    category:    document.getElementById('aCat').value,
    description: document.getElementById('aDesc').value.trim(),
    images:      allImgs(),
    files:       [...attachFiles],
  });

  toast('✅ Assignment saved and published!');

  /* Reset form */
  ['aTitle', 'aDesc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('aCat').value         = 'report';
  document.getElementById('tCt').textContent    = '0';
  document.getElementById('dCt').textContent    = '0';
  upImages = []; capImages = []; attachFiles = [];
  document.getElementById('prevGrid').innerHTML = '';
  document.getElementById('docList').innerHTML  = '';
  document.getElementById('capPrev').innerHTML  = '';
  document.getElementById('capPrev').classList.remove('has');
  ['d1', 'd2', 'd3'].forEach(id => document.getElementById(id).className = 'sdot');
  document.getElementById('d1').className = 'sdot act';
  stopCam();
}

/* ── MANAGE CARDS ── */
function renderMgCards() {
  const arr = getA();
  const c   = document.getElementById('mgCards');
  if (!arr.length) {
    c.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-dim);font-size:.9rem;grid-column:1/-1">No assignments yet. Upload your first one! 🌱</div>';
    return;
  }
  c.innerHTML = arr.map(a => {
    const th = a.images && a.images.length
      ? `<div class="mg-thumb"><img src="${a.images[0]}"></div>`
      : `<div class="mg-thumb">${EMOJI[a.category] || '📋'}</div>`;
    return `<div class="mg-card">
      ${th}
      <div class="mg-info">
        <div class="mg-title">${a.title}</div>
        <div class="mg-meta">${a.category} · ${a.createdAt} · ${(a.images || []).length} img</div>
        <div class="mg-actions">
          <button onclick="nav('assignments')">View</button>
          <button class="mg-del" onclick="mgDel(${a.id})">Delete</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function mgDel(id) {
  if (!confirm('Delete this assignment?')) return;
  delA(id);
  renderMgCards();
  toast('Deleted.');
}

/* ── CONTACT ── */
function sendMsg() {
  const n   = document.getElementById('cName').value.trim();
  const msg = document.getElementById('cMsg').value.trim();
  if (!n || !msg) { toast('Please fill in your name and message.', 'error'); return; }
  toast(`Thanks ${n}! Message noted. 📬`);
  ['cName', 'cEmail', 'cMsg'].forEach(id => document.getElementById(id).value = '');
}

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
document.getElementById('statCount').textContent = getA().length;
