/* FileVault translations (Kiswahili + English).
   To add text: add the key to BOTH languages, then use data-i18n="key" in HTML or t('key') in JS. */
const I18N = {
  sw: {
    'top.note': 'Salama • Binafsi • Rahisi',
    'lang.label': 'Lugha',
    'theme.toggle': 'Badilisha mwonekano (mwanga / giza)',
    'brand.sub': 'Hifadhi ya accounts, files na picha',
    'nav.home': 'Nyumbani', 'nav.accounts': 'Accounts', 'nav.logout': 'Toka',

    'hero.title': 'Tunza accounts, files na picha zako kwa usalama',
    'hero.sub': 'Unda accounts za watu, pakia files na picha kwa kila mmoja, na uzipate wakati wowote.',
    'hero.b1': 'Unda accounts kwa jina, namba ya simu na email',
    'hero.b2': 'Pakia files na picha, na uziangalie kabla ya kuzipakia',
    'hero.b3': 'Data yako ni yako peke yako',
    'feat.title': 'Unachoweza kufanya',
    'feat1.t': 'Unda Accounts', 'feat1.d': 'Weka majina, namba za simu na email za watu wako mahali pamoja.',
    'feat2.t': 'Pakia Files', 'feat2.d': 'Hifadhi picha, PDF, video na nyaraka nyingine kwa kila account.',
    'feat3.t': 'Faragha', 'feat3.d': 'Kila mtumiaji huona accounts na files zake peke yake.',

    'tab.login': 'Ingia', 'tab.register': 'Jisajili',
    'auth.username': 'Username', 'auth.password': 'Password',
    'pw.show': 'Onyesha', 'pw.hide': 'Ficha',
    'btn.login': 'Ingia', 'btn.register': 'Jisajili',
    'hint.noacc': 'Huna account bado? <a href="#" id="toReg">Jisajili hapa</a>',
    'hint.hasacc': 'Una account tayari? <a href="#" id="toReg">Ingia hapa</a>',
    'hint.notreg': 'Kama bado hujajisajili, <a href="#" id="toReg"><b>bonyeza hapa kujisajili</b></a>.',
    'auth.fill': 'Weka username na password.',
    'reg.ok.title': 'Usajili umefanikiwa!', 'reg.welcome': 'Karibu,', 'reg.created': 'Account yako imeundwa.', 'reg.continue': 'Endelea',
    'toast.registered': 'Usajili umefanikiwa!', 'toast.welcome': 'Karibu tena, {name}',

    'page.accounts': 'Accounts',
    'acc.create.title': 'Unda Account Mpya', 'acc.name': 'Jina kamili', 'acc.phone': 'Namba ya simu', 'acc.email': 'Email (si lazima)',
    'acc.btn': 'Create Account', 'acc.list.title': 'Accounts Zako', 'acc.empty': 'Bado hujaunda account yoyote.',
    'acc.files': '{n} files', 'acc.fill': 'Jaza jina na namba ya simu.',
    'btn.back': '← Rudi', 'acc.delete': 'Futa account', 'confirm.delacc': 'Futa account hii pamoja na files zake zote?',

    'upload.title': 'Pakia File au Picha', 'upload.drop': 'Buruta files hapa, au bonyeza kuchagua',
    'stage.title': 'Hakiki kabla ya kupakia', 'stage.clear': 'Futa zote',
    'btn.upload': 'Pakia', 'btn.upload.n': 'Pakia files {n}',
    'stage.skipped': 'Files {n} hazikuongezwa (kikomo: files {max}, kila moja max 50MB).',
    'files.title': 'Files Zilizohifadhiwa', 'files.empty': 'Hakuna file bado.',
    'file.open': 'Fungua', 'file.delete': 'Futa', 'file.remove': 'Ondoa', 'confirm.delfile': 'Futa file hili?',

    'viewer.download': 'Pakua', 'viewer.close': 'Funga', 'viewer.loading': 'Inapakia...',
    'viewer.note': 'Bonyeza <b>Pakua</b> kulifungua kwenye simu/kompyuta yako.',
    'viewer.unsupported': 'Aina hii ya faili ({ext}) haiwezi kuonyeshwa ndani ya app.',
    'viewer.imgfail': 'Picha hii haiwezi kuonyeshwa.',
    'viewer.toobig': 'Faili hili la maandishi ni kubwa mno kuonyeshwa hapa.',
    'viewer.fail': 'Imeshindikana kufungua faili hili.',

    'ok.account_created': 'Account imeundwa kikamilifu',
    'ok.account_deleted': 'Account imefutwa',
    'ok.file_deleted': 'File limefutwa',
    'ok.uploaded_photo': 'Picha imepakiwa kikamilifu',
    'ok.uploaded_file': 'File limepakiwa kikamilifu',
    'ok.uploaded_mixed': 'Files na picha zimepakiwa kikamilifu',

    'err.generic': 'Kuna hitilafu imetokea.',
    'err.login_required': 'Tafadhali ingia (login) kwanza.',
    'err.username_short': 'Username iwe angalau herufi 3.',
    'err.password_short': 'Password iwe angalau herufi 6.',
    'err.username_taken': 'Username hii tayari inatumika.',
    'err.bad_credentials': 'Username au password si sahihi.',
    'err.name_required': 'Jina linahitajika.',
    'err.phone_required': 'Namba ya simu inahitajika.',
    'err.email_invalid': 'Email si sahihi.',
    'err.account_not_found': 'Account haipo.',
    'err.file_not_found': 'Faili haipo.',
    'err.file_missing': 'Faili halipo kwenye hifadhi.',
    'err.no_file': 'Chagua faili kwanza.',
    'err.file_too_large': 'Faili ni kubwa mno (max 50MB).',
    'err.upload_failed': 'Upload imeshindikana. Files bado ziko hapa, jaribu tena.',
    'err.network': 'Tatizo la mtandao. Files bado ziko hapa, jaribu tena.',

    'foot.about.title': 'Kuhusu FileVault',
    'foot.about': 'FileVault ni app ya kutunza accounts za watu pamoja na files na picha zao mahali pamoja, kwa usalama na urahisi.',
    'foot.links': 'Viungo vya haraka',
    'foot.info.title': 'Taarifa', 'foot.info': 'Hadi files 20 kwa mara moja, kila moja isizidi MB 50.',
    'foot.copy': '© 2026 FileVault. Haki zote zimehifadhiwa.'
  },
  en: {
    'top.note': 'Secure • Private • Simple',
    'lang.label': 'Language',
    'theme.toggle': 'Toggle light / dark mode',
    'brand.sub': 'Accounts, files and photos storage',
    'nav.home': 'Home', 'nav.accounts': 'Accounts', 'nav.logout': 'Logout',

    'hero.title': 'Store your accounts, files and photos securely',
    'hero.sub': 'Create accounts for people, upload files and photos for each one, and access them anytime.',
    'hero.b1': 'Create accounts with name, phone number and email',
    'hero.b2': 'Upload files and photos, and preview them before uploading',
    'hero.b3': 'Your data stays yours alone',
    'feat.title': 'What you can do',
    'feat1.t': 'Create Accounts', 'feat1.d': 'Keep the names, phone numbers and emails of your people in one place.',
    'feat2.t': 'Upload Files', 'feat2.d': 'Save photos, PDFs, videos and other documents for each account.',
    'feat3.t': 'Privacy', 'feat3.d': 'Every user sees only their own accounts and files.',

    'tab.login': 'Login', 'tab.register': 'Register',
    'auth.username': 'Username', 'auth.password': 'Password',
    'pw.show': 'Show', 'pw.hide': 'Hide',
    'btn.login': 'Login', 'btn.register': 'Register',
    'hint.noacc': 'No account yet? <a href="#" id="toReg">Register here</a>',
    'hint.hasacc': 'Already have an account? <a href="#" id="toReg">Login here</a>',
    'hint.notreg': "If you haven't registered yet, <a href=\"#\" id=\"toReg\"><b>click here to register</b></a>.",
    'auth.fill': 'Enter your username and password.',
    'reg.ok.title': 'Registration successful!', 'reg.welcome': 'Welcome,', 'reg.created': 'Your account has been created.', 'reg.continue': 'Continue',
    'toast.registered': 'Registration successful!', 'toast.welcome': 'Welcome back, {name}',

    'page.accounts': 'Accounts',
    'acc.create.title': 'Create New Account', 'acc.name': 'Full name', 'acc.phone': 'Phone number', 'acc.email': 'Email (optional)',
    'acc.btn': 'Create Account', 'acc.list.title': 'Your Accounts', 'acc.empty': "You haven't created any accounts yet.",
    'acc.files': '{n} files', 'acc.fill': 'Enter a name and phone number.',
    'btn.back': '← Back', 'acc.delete': 'Delete account', 'confirm.delacc': 'Delete this account and all its files?',

    'upload.title': 'Upload a File or Photo', 'upload.drop': 'Drag files here, or click to choose',
    'stage.title': 'Preview before uploading', 'stage.clear': 'Clear all',
    'btn.upload': 'Upload', 'btn.upload.n': 'Upload {n} files',
    'stage.skipped': '{n} file(s) were not added (limit: {max} files, 50MB each).',
    'files.title': 'Saved Files', 'files.empty': 'No files yet.',
    'file.open': 'Open', 'file.delete': 'Delete', 'file.remove': 'Remove', 'confirm.delfile': 'Delete this file?',

    'viewer.download': 'Download', 'viewer.close': 'Close', 'viewer.loading': 'Loading...',
    'viewer.note': 'Press <b>Download</b> to open it on your phone/computer.',
    'viewer.unsupported': "This file type ({ext}) can't be shown inside the app.",
    'viewer.imgfail': "This image can't be displayed.",
    'viewer.toobig': 'This text file is too large to show here.',
    'viewer.fail': 'Could not open this file.',

    'ok.account_created': 'Account created successfully',
    'ok.account_deleted': 'Account deleted',
    'ok.file_deleted': 'File deleted',
    'ok.uploaded_photo': 'Photo uploaded successfully',
    'ok.uploaded_file': 'File uploaded successfully',
    'ok.uploaded_mixed': 'Files and photos uploaded successfully',

    'err.generic': 'Something went wrong.',
    'err.login_required': 'Please log in first.',
    'err.username_short': 'Username must be at least 3 characters.',
    'err.password_short': 'Password must be at least 6 characters.',
    'err.username_taken': 'This username is already taken.',
    'err.bad_credentials': 'Incorrect username or password.',
    'err.name_required': 'Name is required.',
    'err.phone_required': 'Phone number is required.',
    'err.email_invalid': 'Email is not valid.',
    'err.account_not_found': 'Account not found.',
    'err.file_not_found': 'File not found.',
    'err.file_missing': 'The file is missing from storage.',
    'err.no_file': 'Please choose a file first.',
    'err.file_too_large': 'The file is too large (max 50MB).',
    'err.upload_failed': 'Upload failed. Your files are still here, please try again.',
    'err.network': 'Network problem. Your files are still here, please try again.',

    'foot.about.title': 'About FileVault',
    'foot.about': 'FileVault keeps the accounts of your people, together with their files and photos, in one safe and simple place.',
    'foot.links': 'Quick links',
    'foot.info.title': 'Information', 'foot.info': 'Up to 20 files at a time, each no larger than 50MB.',
    'foot.copy': '© 2026 FileVault. All rights reserved.'
  }
};

let LANG = 'sw';
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};
const hasT = key => Object.prototype.hasOwnProperty.call(I18N[LANG], key);
function t(key, vars) {
  let s = (I18N[LANG] && I18N[LANG][key]) || I18N.sw[key] || key;
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
  return s;
}
function applyStaticI18n() {
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); el.setAttribute('aria-label', t(el.dataset.i18nTitle)); });
}
function setLang(l) {
  LANG = I18N[l] ? l : 'sw';
  store.set('fv_lang', LANG);
  applyStaticI18n();
}
LANG = I18N[store.get('fv_lang')] ? store.get('fv_lang') : 'sw';
