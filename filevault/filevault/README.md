# FileVault

Web app ya kutunza **accounts za watu** pamoja na **files na picha** zao, mahali pamoja.
Inapatikana kwa **Kiswahili na English**, na ina **hali ya mwanga na giza**.

## Inavyofanya kazi
1. Mtu anafungua link ya app, anajisajili (username + password) au anaingia.
2. Ndani anaunda accounts (jina, namba ya simu, email si lazima). Ukiunda unaona ujumbe wa mafanikio
   na account inaonekana kwenye orodha.
3. Akibonyeza account anachagua files/picha. Zinaonekana kwanza kama **hakiki (preview)**, kisha
   anabonyeza **Pakia**. Anaona ujumbe wa "uploaded successfully".
4. Kila mtumiaji anaona **data yake peke yake**. Mtu mwingine akijisajili anaanza na app tupu.
   Ukimpa mtu username na password yako ataona data yako; ukimpa link tu, ataona ukurasa wa kuingia.

Files zinafunguka ndani ya app: picha, PDF, video, sauti na maandishi (txt, csv, json).
Word, Excel, PowerPoint, zip na nyingine zinapakuliwa ili zifunguliwe kwenye app ya simu/kompyuta
(kivinjari hakiwezi kuzionyesha ndani ya ukurasa).

## Muundo wa project
```
filevault/
├── server.js            # Backend (Express + SQLite + upload)
├── package.json
├── .gitignore
├── README.md
└── public/              # Frontend
    ├── index.html       # Muundo wa kurasa
    ├── css/style.css    # Muonekano. Rangi zote ziko juu ya faili (:root na [data-theme="dark"])
    └── js/
        ├── i18n.js      # Tafsiri za Kiswahili na English
        └── app.js       # Mantiki ya app
```
Data inahifadhiwa kwenye folda `data/` (`app.db` na `uploads/`), inaundwa yenyewe app ikianza.

## Kuendesha kwenye kompyuta
Unahitaji Node.js 18 au zaidi.
```
npm install
npm start
```
Kisha fungua http://localhost:3000

Mipangilio (si lazima), kupitia environment variables:
| Jina | Maana | Chaguo-msingi |
|------|-------|---------------|
| `PORT` | Port ya seva | `3000` |
| `DATA_DIR` | Folda ya database na files | `./data` |
| `NODE_ENV` | Weka `production` ukiwa online (cookie inakuwa `secure`, inahitaji HTTPS) | tupu |

## Kubadilisha muonekano
- **Rangi:** hariri `public/css/style.css`, sehemu ya juu (`:root` kwa mwanga, `[data-theme="dark"]` kwa giza).
  Rangi kuu ni `--brand` (buluu) na `--accent` (dhahabu).
- **Maneno:** hariri `public/js/i18n.js`. Kila neno lina matoleo mawili (`sw` na `en`).
- **Lugha mpya:** nakili kitu cha `en` ndani ya `I18N`, kipe msimbo (mfano `fr`), kitafsiri, kisha ongeza
  `<option value="fr">Français</option>` kwenye `#langSel` ndani ya `index.html`.
- **Jina/nembo:** badilisha "FileVault" kwenye `index.html` na `i18n.js`; nembo ni SVG ndogo ndani ya `index.html`.

## Kuiweka online (ili watu wafungue kwa link)
Tumia host inayoruhusu Node.js na **hifadhi ya kudumu** (persistent disk/volume): mfano VPS, Railway,
Fly.io, au Render. Hosting nyingi za bure **hazina** disk ya kudumu, kwa hiyo files na accounts hupotea
app ikiwashwa upya. Kwa matumizi ya kweli chagua mpango wenye disk au VPS.

Mipangilio:
- Build command: `npm install`
- Start command: `npm start`
- `NODE_ENV=production`
- `DATA_DIR=/data` na uunganishe disk ya kudumu kwenye `/data`
- Tumia HTTPS (host nyingi hutoa bila malipo)

**Backup:** nakili folda ya `DATA_DIR` (ina `app.db` na `uploads/`).

## Usalama (muhtasari)
- Password zinahifadhiwa kwa bcrypt, si maandishi wazi.
- Kila account, file na upload vinakaguliwa kwamba ni vya mtumiaji aliyeingia.
- Files za HTML/SVG/JS hazifunguliwi ndani ya app (zinapakuliwa tu), kuzuia msimbo hatari.
- Kikomo: files 20 kwa mara moja, MB 50 kila moja.
- Mapendekezo kabla ya kuifungua kwa watu wengi: weka kikomo cha majaribio ya kuingia (rate limiting)
  na backup ya mara kwa mara.
