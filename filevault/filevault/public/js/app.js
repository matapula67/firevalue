'use strict';
/* FileVault frontend. Texts live in js/i18n.js (t('key')). */
const $ = id => document.getElementById(id);
const MAX_FILES = 20, MAX_SIZE = 50 * 1024 * 1024;
let mode = 'login', loggedIn = false, currentAcc = null;
let accountsCache = null, filesCache = [], pending = [];
let pendingUser = '', authBusy = false, uploading = false;

/* ---------- helpers ---------- */
function toast(msg, err) {
  const el = document.createElement('div');
  el.className = 'toast' + (err ? ' err' : '');
  el.textContent = msg;
  $('toasts').appendChild(el);
  setTimeout(() => el.remove(), err ? 7000 : 3500);
}
const errText = e => (e && e.code && hasT('err.' + e.code)) ? t('err.' + e.code) : ((e && e.message) || t('err.generic'));
const okText = d => (d && d.code && hasT('ok.' + d.code)) ? t('ok.' + d.code) : ((d && d.message) || '');
const fail = e => { if (!(e && e.silent)) toast(errText(e), true); };

async function api(url, opts = {}) {
  const r = await fetch(url, { credentials: 'same-origin', ...opts });
  let data = {};
  try { data = await r.json(); } catch (e) {}
  if (!r.ok) {
    const err = new Error(data.error || t('err.generic'));
    err.code = data.code; err.status = r.status;
    if (r.status === 401 && !url.includes('/api/login') && !url.includes('/api/register')) { showAuth(); err.silent = true; }
    throw err;
  }
  return data;
}
const json = body => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtSize = n => n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
const fileUrl = (id, dl) => window.__fileUrl ? window.__fileUrl(id) : '/api/files/' + id + (dl ? '?download=1' : '');

const EXT_MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp',
  pdf: 'application/pdf', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', m4v: 'video/mp4', mp3: 'audio/mpeg', wav: 'audio/wav',
  ogg: 'audio/ogg', m4a: 'audio/mp4', txt: 'text/plain', csv: 'text/csv', json: 'application/json', md: 'text/markdown', log: 'text/plain', xml: 'application/xml' };
const TEXT_EXT = /\.(txt|csv|json|md|log|xml)$/i;
const extOf = n => (String(n).split('.').pop() || '').toLowerCase();
const guessMime = (name, type) => (type && type !== 'application/octet-stream') ? type : (EXT_MIME[extOf(name)] || type || '');
function fileIcon(name, mime) {
  const e = extOf(name);
  if (/^audio\//.test(mime)) return '🎵';
  if (/^video\//.test(mime)) return '🎬';
  if (mime === 'application/pdf') return '📕';
  if (/^(doc|docx|odt|rtf)$/.test(e)) return '📝';
  if (/^(xls|xlsx|csv|ods)$/.test(e)) return '📊';
  if (/^(ppt|pptx|odp)$/.test(e)) return '📽️';
  if (/^(zip|rar|7z|tar|gz)$/.test(e)) return '🗜️';
  if (/^(txt|md|log|json|xml)$/.test(e)) return '📄';
  return '📎';
}
function thumbHtml(name, mime, url) {
  if (/^image\//.test(mime)) return `<img loading="lazy" src="${url}" alt="" onerror="this.replaceWith(document.createTextNode('🖼️'))">`;
  if (/^video\//.test(mime)) return `<video src="${url}#t=0.5" preload="metadata" muted playsinline></video>`;
  const e = extOf(name);
  return `<div style="font-size:34px;line-height:1">${fileIcon(name, mime)}</div>` + (e && e.length <= 5 ? `<span class="ext">${esc(e.toUpperCase())}</span>` : '');
}

/* ---------- theme & language ---------- */
function paintThemeIcon() {
  $('themeIcon').textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
}
function setTheme(th) {
  document.documentElement.setAttribute('data-theme', th);
  store.set('fv_theme', th);
  paintThemeIcon();
}
$('themeBtn').onclick = () => setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');

function rerenderAll() {
  setMode(mode);
  updatePwLabel();
  renderBanner();
  if (accountsCache) renderAccounts();
  if (currentAcc) renderFiles(filesCache);
  renderStage();
  if (!$('viewer').classList.contains('hidden')) { $('vDl').textContent = t('viewer.download'); $('vClose').textContent = t('viewer.close'); }
}
$('langSel').onchange = e => { setLang(e.target.value); rerenderAll(); };

/* ---------- views ---------- */
function paintChrome() {
  $('userBox').classList.toggle('hidden', !loggedIn);
  $('navAccounts').classList.toggle('hidden', !loggedIn);
  $('navAccounts').classList.toggle('active', loggedIn);
}
function showAuth() {
  loggedIn = false; currentAcc = null;
  $('appView').classList.add('hidden'); $('authView').classList.remove('hidden');
  $('authTabs').classList.remove('hidden'); $('authBox').classList.remove('hidden'); $('regOk').classList.add('hidden');
  $('ap').type = 'password'; $('ap').value = '';
  setMode('login'); updatePwLabel(); paintChrome();
}
function showApp(username) {
  loggedIn = true;
  $('authView').classList.add('hidden'); $('appView').classList.remove('hidden');
  $('who').textContent = username; paintChrome(); showList();
}
function renderBanner() {
  if (!loggedIn) return;
  const home = `<a href="#" data-go="list">${esc(t('nav.home'))}</a>`;
  const accs = `<a href="#" data-go="list">${esc(t('page.accounts'))}</a>`;
  if (currentAcc) {
    $('pageTitle').textContent = currentAcc.name;
    $('crumbs').innerHTML = `${home} › ${accs} › ${esc(currentAcc.name)}`;
  } else {
    $('pageTitle').textContent = t('page.accounts');
    $('crumbs').innerHTML = `${home} › ${esc(t('page.accounts'))}`;
  }
  document.querySelectorAll('#crumbs [data-go]').forEach(a => a.onclick = e => { e.preventDefault(); showList(); });
}
const goHome = e => { e.preventDefault(); loggedIn ? showList() : showAuth(); };
['brandLink', 'navHome', 'footHome', 'navAccounts', 'footAccounts'].forEach(id => $(id).onclick = goHome);

/* ---------- auth ---------- */
function authMsg(text, type) {
  const m = $('authMsg');
  if (!text) { m.classList.add('hidden'); return; }
  m.textContent = text; m.className = 'msg ' + (type || 'err');
}
function bindToReg() { const a = $('toReg'); if (a) a.onclick = e => { e.preventDefault(); setMode(mode === 'login' ? 'register' : 'login'); }; }
function setMode(m) {
  mode = m; authMsg('');
  $('tabLogin').classList.toggle('active', m === 'login');
  $('tabRegister').classList.toggle('active', m === 'register');
  $('authBtn').textContent = t(m === 'login' ? 'btn.login' : 'btn.register');
  $('ap').autocomplete = m === 'login' ? 'current-password' : 'new-password';
  $('authHint').innerHTML = t(m === 'login' ? 'hint.noacc' : 'hint.hasacc');
  bindToReg();
}
function updatePwLabel() { $('pwToggle').textContent = t($('ap').type === 'password' ? 'pw.show' : 'pw.hide'); }
$('tabLogin').onclick = () => setMode('login');
$('tabRegister').onclick = () => setMode('register');
$('pwToggle').onclick = () => { $('ap').type = $('ap').type === 'password' ? 'text' : 'password'; updatePwLabel(); };

async function doAuth() {
  if (authBusy) return;
  const username = $('au').value.trim(), password = $('ap').value;
  if (!username || !password) return authMsg(t('auth.fill'), 'err');
  authBusy = true; $('authBtn').disabled = true; authMsg('');
  try {
    const d = await api('/api/' + mode, json({ username, password }));
    $('ap').value = '';
    if (mode === 'register') {
      pendingUser = d.username;
      $('regName').textContent = d.username;
      $('authTabs').classList.add('hidden'); $('authBox').classList.add('hidden'); $('regOk').classList.remove('hidden');
      toast(t('toast.registered'));
    } else {
      toast(t('toast.welcome', { name: d.username }));
      showApp(d.username);
    }
  } catch (err) {
    authMsg(errText(err), 'err');
    if (mode === 'login' && err.code === 'bad_credentials') { $('authHint').innerHTML = t('hint.notreg'); bindToReg(); }
  } finally { authBusy = false; $('authBtn').disabled = false; }
}
$('authBtn').onclick = doAuth;
['au', 'ap'].forEach(id => $(id).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doAuth(); } }));
$('regContinue').onclick = () => showApp(pendingUser);
$('logoutBtn').onclick = async () => { try { await api('/api/logout', { method: 'POST' }); } catch (e) {} clearStage(); showAuth(); };

/* ---------- accounts ---------- */
function showList() {
  clearStage();
  currentAcc = null;
  $('detailView').classList.add('hidden'); $('listView').classList.remove('hidden');
  renderBanner(); loadAccounts();
}
async function loadAccounts() {
  try { accountsCache = await api('/api/accounts'); renderAccounts(); } catch (e) { fail(e); }
}
function renderAccounts() {
  const rows = accountsCache || [];
  $('count').textContent = rows.length;
  $('accList').innerHTML = rows.length ? rows.map(a => `
    <div class="list-item" data-id="${a.id}" tabindex="0" role="button">
      <div><strong>${esc(a.name)}</strong><small>${esc(a.phone)}${a.email ? ' · ' + esc(a.email) : ''}</small></div>
      <span class="badge">${esc(t('acc.files', { n: a.file_count }))}</span>
    </div>`).join('') : `<div class="empty">${esc(t('acc.empty'))}</div>`;
  document.querySelectorAll('.list-item').forEach(el => {
    const open = () => openAccount(el.dataset.id);
    el.onclick = open; el.onkeydown = e => { if (e.key === 'Enter') open(); };
  });
}
async function createAccount() {
  const name = $('an').value.trim(), phone = $('ap2').value.trim(), email = $('ae').value.trim();
  if (!name || !phone) return toast(t('acc.fill'), true);
  try {
    const d = await api('/api/accounts', json({ name, phone, email }));
    toast(okText(d));
    ['an', 'ap2', 'ae'].forEach(id => $(id).value = '');
    loadAccounts();
  } catch (err) { fail(err); }
}
$('accBtn').onclick = createAccount;
['an', 'ap2', 'ae'].forEach(id => $(id).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); createAccount(); } }));

async function openAccount(id) {
  try {
    const d = await api(`/api/accounts/${id}/files`);
    clearStage();
    currentAcc = d.account; filesCache = d.files;
    $('listView').classList.add('hidden'); $('detailView').classList.remove('hidden');
    $('dName').textContent = d.account.name;
    $('dInfo').textContent = d.account.phone + (d.account.email ? ' · ' + d.account.email : '');
    renderBanner(); renderFiles(d.files);
  } catch (e) { fail(e); }
}
$('backBtn').onclick = showList;
$('delAccBtn').onclick = async () => {
  if (!confirm(t('confirm.delacc'))) return;
  try { const d = await api('/api/accounts/' + currentAcc.id, { method: 'DELETE' }); toast(okText(d)); showList(); }
  catch (err) { fail(err); }
};

/* ---------- saved files ---------- */
function renderFiles(files) {
  $('fcount').textContent = files.length;
  $('fileGrid').innerHTML = files.length ? files.map(f => `<div class="file">
      <div class="thumb">${thumbHtml(f.original_name, f.mime || '', fileUrl(f.id))}</div>
      <div class="meta">${esc(f.original_name)}<span>${fmtSize(f.size)}</span></div>
      <div class="acts"><button data-v="${f.id}" type="button">${esc(t('file.open'))}</button><button data-d="${f.id}" type="button">${esc(t('file.delete'))}</button></div>
    </div>`).join('') : `<div class="empty" style="grid-column:1/-1">${esc(t('files.empty'))}</div>`;
  const byId = Object.fromEntries(files.map(f => [f.id, f]));
  document.querySelectorAll('#fileGrid [data-v]').forEach(b => b.onclick = () => viewFile(byId[b.dataset.v]));
  document.querySelectorAll('#fileGrid .thumb').forEach((el, i) => el.onclick = () => viewFile(files[i]));
  document.querySelectorAll('#fileGrid [data-d]').forEach(b => b.onclick = async () => {
    if (!confirm(t('confirm.delfile'))) return;
    try { const d = await api('/api/files/' + b.dataset.d, { method: 'DELETE' }); toast(okText(d)); openAccount(currentAcc.id); }
    catch (err) { fail(err); }
  });
}

/* ---------- viewer (works for saved and not-yet-uploaded files) ---------- */
async function viewFile(f) {
  if (!f) return;
  const m = (f.mime || '').toLowerCase(), url = f.url || fileUrl(f.id), body = $('vBody');
  $('vName').textContent = f.original_name;
  $('vDl').href = f.url || fileUrl(f.id, true); $('vDl').setAttribute('download', f.original_name);
  body.innerHTML = `<span class="muted">${esc(t('viewer.loading'))}</span>`;
  $('viewer').classList.remove('hidden');
  const el = (tag, attrs) => Object.assign(document.createElement(tag), attrs);
  const note = txt => { body.innerHTML = ''; const d = el('div', { className: 'empty' }); d.innerHTML = esc(txt) + '<br><br>' + t('viewer.note'); body.appendChild(d); };
  if (/^image\//.test(m)) { body.innerHTML = ''; const i = el('img', { alt: f.original_name }); i.onerror = () => note(t('viewer.imgfail')); i.src = url; body.appendChild(i); }
  else if (m === 'application/pdf') { body.innerHTML = ''; body.appendChild(el('iframe', { src: url, title: f.original_name })); }
  else if (/^video\//.test(m)) { body.innerHTML = ''; body.appendChild(el('video', { src: url, controls: true })); }
  else if (/^audio\//.test(m)) { body.innerHTML = ''; body.appendChild(el('audio', { src: url, controls: true })); }
  else if (/^text\//.test(m) || /^application\/(json|xml)$/.test(m) || TEXT_EXT.test(f.original_name)) {
    if (f.size > 2 * 1024 * 1024) return note(t('viewer.toobig'));
    try { const r = await fetch(url); body.innerHTML = ''; body.appendChild(el('pre', { textContent: await r.text() })); }
    catch (e) { note(t('viewer.fail')); }
  } else note(t('viewer.unsupported', { ext: extOf(f.original_name) || '?' }));
}
function closeViewer() { $('viewer').classList.add('hidden'); $('vBody').innerHTML = ''; }
$('vClose').onclick = closeViewer;
$('viewer').onclick = e => { if (e.target.id === 'viewer') closeViewer(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeViewer(); });

/* ---------- pick, preview, then upload ---------- */
function clearStage() {
  pending.forEach(p => URL.revokeObjectURL(p.url)); pending = [];
  $('fileInput').value = ''; renderStage();
}
function stage(fileList) {
  if (!currentAcc) return;
  let skipped = 0;
  [...fileList].forEach(file => {
    const key = [file.name, file.size, file.lastModified].join('|');
    if (pending.some(p => p.key === key)) return;
    if (file.size > MAX_SIZE || pending.length >= MAX_FILES) { skipped++; return; }
    pending.push({ key, file, mime: guessMime(file.name, file.type), url: URL.createObjectURL(file) });
  });
  if (skipped) toast(t('stage.skipped', { n: skipped, max: MAX_FILES }), true);
  $('fileInput').value = '';
  renderStage();
}
function renderStage() {
  $('stage').classList.toggle('hidden', !pending.length);
  $('stageCount').textContent = pending.length;
  $('uploadBtn').textContent = pending.length > 1 ? t('btn.upload.n', { n: pending.length }) : t('btn.upload');
  $('stageGrid').innerHTML = pending.map((p, i) => `<div class="file">
      <div class="thumb">${thumbHtml(p.file.name, p.mime, p.url)}</div>
      <div class="meta">${esc(p.file.name)}<span>${fmtSize(p.file.size)}</span></div>
      <div class="acts"><button data-sv="${i}" type="button">${esc(t('file.open'))}</button><button data-sr="${i}" type="button">${esc(t('file.remove'))}</button></div>
    </div>`).join('');
  const open = i => { const p = pending[i]; if (p) viewFile({ original_name: p.file.name, mime: p.mime, size: p.file.size, url: p.url }); };
  document.querySelectorAll('[data-sv]').forEach(b => b.onclick = () => open(+b.dataset.sv));
  document.querySelectorAll('#stageGrid .thumb').forEach((el, i) => el.onclick = () => open(i));
  document.querySelectorAll('[data-sr]').forEach(b => b.onclick = () => { const i = +b.dataset.sr; URL.revokeObjectURL(pending[i].url); pending.splice(i, 1); renderStage(); });
}
function upload() {
  if (!pending.length || !currentAcc || uploading) return;
  const fd = new FormData();
  pending.forEach(p => fd.append('files', p.file));
  const xhr = new XMLHttpRequest();
  xhr.open('POST', `/api/accounts/${currentAcc.id}/files`);
  uploading = true; $('uploadBtn').disabled = true;
  $('prog').classList.remove('hidden'); $('prog').value = 0;
  xhr.upload.onprogress = e => { if (e.lengthComputable) $('prog').value = e.loaded / e.total * 100; };
  const done = () => { uploading = false; $('uploadBtn').disabled = false; $('prog').classList.add('hidden'); };
  xhr.onload = () => {
    done();
    let d = {}; try { d = JSON.parse(xhr.responseText); } catch (e) {}
    if (xhr.status === 401) return showAuth();
    if (xhr.status >= 200 && xhr.status < 300) { toast(okText(d)); clearStage(); openAccount(currentAcc.id); }
    else toast(errText({ code: d.code || 'upload_failed', message: d.error }), true);
  };
  xhr.onerror = () => { done(); toast(t('err.network'), true); };
  xhr.send(fd);
}
$('fileInput').onchange = e => stage(e.target.files);
$('uploadBtn').onclick = upload;
$('stageClear').onclick = clearStage;
const drop = $('drop');
['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', e => stage(e.dataTransfer.files));

/* ---------- start ---------- */
$('langSel').value = LANG;
paintThemeIcon();
applyStaticI18n();
setMode('login');
updatePwLabel();
(async () => {
  try { const d = await api('/api/me'); d.username ? showApp(d.username) : showAuth(); } catch (e) { showAuth(); }
})();
