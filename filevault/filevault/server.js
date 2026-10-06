const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'app.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  owner_id INTEGER NOT NULL,
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,
  mime TEXT,
  size INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

const app = express();
app.use(express.json());
app.use(cookieParser());

// ---------- auth ----------
function startSession(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, userId);
  res.cookie('sid', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 3600 * 1000,
  });
}

function auth(req, res, next) {
  const token = req.cookies.sid;
  const row = token && db.prepare(
    'SELECT u.id, u.username FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?'
  ).get(token);
  if (!row) return res.status(401).json({ error: 'Tafadhali ingia (login) kwanza.', code: 'login_required' });
  req.user = row;
  next();
}

app.post('/api/register', (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  if (username.length < 3) return res.status(400).json({ error: 'Username iwe angalau herufi 3.', code: 'username_short' });
  if (password.length < 6) return res.status(400).json({ error: 'Password iwe angalau herufi 6.', code: 'password_short' });
  if (db.prepare('SELECT 1 FROM users WHERE username = ?').get(username))
    return res.status(409).json({ error: 'Username hii tayari inatumika.', code: 'username_taken' });
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hash);
  startSession(res, info.lastInsertRowid);
  res.json({ ok: true, username });
});

app.post('/api/login', (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  const u = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!u || !bcrypt.compareSync(password, u.password_hash))
    return res.status(401).json({ error: 'Username au password si sahihi.', code: 'bad_credentials' });
  startSession(res, u.id);
  res.json({ ok: true, username: u.username });
});

app.post('/api/logout', (req, res) => {
  if (req.cookies.sid) db.prepare('DELETE FROM sessions WHERE token = ?').run(req.cookies.sid);
  res.clearCookie('sid');
  res.json({ ok: true });
});

app.get('/api/me', (req, res) => {
  const token = req.cookies.sid;
  const row = token && db.prepare('SELECT u.username FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?').get(token);
  res.json({ username: row ? row.username : null });
});

// ---------- accounts ----------
app.get('/api/accounts', auth, (req, res) => {
  const rows = db.prepare(`
    SELECT a.id, a.name, a.phone, a.email, a.created_at,
      (SELECT COUNT(*) FROM files f WHERE f.account_id = a.id) AS file_count
    FROM accounts a WHERE a.owner_id = ? ORDER BY a.id DESC`).all(req.user.id);
  res.json(rows);
});

app.post('/api/accounts', auth, (req, res) => {
  const name = String(req.body.name || '').trim();
  const phone = String(req.body.phone || '').trim();
  const email = String(req.body.email || '').trim();
  if (!name) return res.status(400).json({ error: 'Jina linahitajika.', code: 'name_required' });
  if (!phone) return res.status(400).json({ error: 'Namba ya simu inahitajika.', code: 'phone_required' });
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Email si sahihi.', code: 'email_invalid' });
  const info = db.prepare('INSERT INTO accounts (owner_id, name, phone, email) VALUES (?, ?, ?, ?)')
    .run(req.user.id, name, phone, email || null);
  res.json({ ok: true, code: 'account_created', message: 'Account created successfully', id: info.lastInsertRowid });
});

function ownAccount(req, res) {
  const a = db.prepare('SELECT * FROM accounts WHERE id = ? AND owner_id = ?').get(req.params.id, req.user.id);
  if (!a) res.status(404).json({ error: 'Account haipo.', code: 'account_not_found' });
  return a;
}

app.delete('/api/accounts/:id', auth, (req, res) => {
  const a = ownAccount(req, res); if (!a) return;
  const files = db.prepare('SELECT stored_name FROM files WHERE account_id = ?').all(a.id);
  files.forEach(f => fs.rmSync(path.join(UPLOAD_DIR, f.stored_name), { force: true }));
  db.prepare('DELETE FROM accounts WHERE id = ?').run(a.id);
  res.json({ ok: true, code: 'account_deleted', message: 'Account deleted' });
});

// ---------- files ----------
const EXT_MIME = {
  jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', gif:'image/gif', webp:'image/webp', bmp:'image/bmp', heic:'image/heic',
  pdf:'application/pdf', mp4:'video/mp4', webm:'video/webm', mov:'video/quicktime', m4v:'video/mp4', ogv:'video/ogg',
  mp3:'audio/mpeg', wav:'audio/wav', ogg:'audio/ogg', m4a:'audio/mp4', aac:'audio/aac',
  txt:'text/plain', csv:'text/csv', json:'application/json', md:'text/markdown', xml:'application/xml', log:'text/plain',
};
function guessMime(name, mime) {
  const m = (mime || '').toLowerCase();
  if (m && m !== 'application/octet-stream') return m;
  const ext = path.extname(name || '').slice(1).toLowerCase();
  return EXT_MIME[ext] || m || 'application/octet-stream';
}

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex') + path.extname(file.originalname).slice(0, 10)),
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
});

app.get('/api/accounts/:id/files', auth, (req, res) => {
  const a = ownAccount(req, res); if (!a) return;
  const files = db.prepare('SELECT id, original_name, mime, size, created_at FROM files WHERE account_id = ? ORDER BY id DESC').all(a.id)
    .map(f => ({ ...f, mime: guessMime(f.original_name, f.mime) }));
  res.json({ account: a, files });
});

app.post('/api/accounts/:id/files', auth, (req, res) => {
  const a = ownAccount(req, res); if (!a) return;
  upload.array('files', 20)(req, res, err => {
    if (err) return res.status(400).json(err.code === 'LIMIT_FILE_SIZE' ? { error: 'Faili ni kubwa mno (max 50MB).', code: 'file_too_large' } : { error: 'Upload imeshindikana.', code: 'upload_failed' });
    if (!req.files || !req.files.length) return res.status(400).json({ error: 'Chagua faili kwanza.', code: 'no_file' });
    const ins = db.prepare('INSERT INTO files (account_id, owner_id, original_name, stored_name, mime, size) VALUES (?, ?, ?, ?, ?, ?)');
    req.files.forEach(f => { f.mimetype = guessMime(f.originalname, f.mimetype); ins.run(a.id, req.user.id, f.originalname, f.filename, f.mimetype, f.size); });
    const photos = req.files.filter(f => f.mimetype.startsWith('image/')).length;
    const code = photos === req.files.length ? 'uploaded_photo' : photos === 0 ? 'uploaded_file' : 'uploaded_mixed';
    const msg = { uploaded_photo: 'Photo uploaded successfully', uploaded_file: 'File uploaded successfully', uploaded_mixed: 'Files and photos uploaded successfully' }[code];
    res.json({ ok: true, code, message: msg, count: req.files.length });
  });
});

function ownFile(req, res) {
  const f = db.prepare('SELECT * FROM files WHERE id = ? AND owner_id = ?').get(req.params.fid, req.user.id);
  if (!f) res.status(404).json({ error: 'Faili haipo.', code: 'file_not_found' });
  return f;
}

app.get('/api/files/:fid', auth, (req, res) => {
  const f = ownFile(req, res); if (!f) return;
  const p = path.join(UPLOAD_DIR, f.stored_name);
  if (!fs.existsSync(p)) return res.status(404).json({ error: 'Faili halipo kwenye hifadhi.', code: 'file_missing' });
  if (req.query.download) return res.download(p, f.original_name);
  const m = guessMime(f.original_name, f.mime);
  res.set('X-Content-Type-Options', 'nosniff');
  // Safe types open inline; everything else is downloaded (prevents stored XSS from html/svg/js)
  const mediaOk = /^image\/(png|jpe?g|gif|webp|bmp)$/.test(m) || m === 'application/pdf' || /^(video|audio)\//.test(m);
  const textOk = /^text\/(plain|csv|markdown|xml)$/.test(m) || /^application\/(json|xml)$/.test(m) || /\.(txt|csv|json|md|log|xml)$/i.test(f.original_name);
  if (textOk) { res.type('text/plain; charset=utf-8'); return res.sendFile(p); }
  if (mediaOk) { res.type(m); return res.sendFile(p); }
  res.download(p, f.original_name);
});

app.delete('/api/files/:fid', auth, (req, res) => {
  const f = ownFile(req, res); if (!f) return;
  fs.rmSync(path.join(UPLOAD_DIR, f.stored_name), { force: true });
  db.prepare('DELETE FROM files WHERE id = ?').run(f.id);
  res.json({ ok: true, code: 'file_deleted', message: 'File deleted' });
});

app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => console.log('FileVault inafanya kazi: http://localhost:' + PORT));
