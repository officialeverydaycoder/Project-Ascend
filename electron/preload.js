const { contextBridge, ipcRenderer } = require('electron');

// ── Verified JEE Resources (pre‑loaded on first launch) ─────────────────────────
const DEFAULT_RESOURCES = [

  // ══════════ OFFICIAL / SCHEDULE ══════════

  {
    title: 'JEE Advanced Official Website & Past Papers',
    type: 'Link', subject: 'General',
    url: 'https://jeeadv.ac.in/archive.html',
    tags: 'JEE Advanced, official archive, past papers',
    note: 'Official JEE Advanced past question papers (download by year) from the official site.',
    addedAt: new Date(0).toISOString()
  },
  {
    title: 'JEE Advanced 2026 Syllabus Official Page',
    type: 'Link', subject: 'General',
    url: 'https://jeeadv.ac.in/',
    tags: 'JEE Advanced, syllabus, official',
    note: 'Official JEE Advanced home page with syllabus, brochures and notifications.',
    addedAt: new Date(0).toISOString()
  },

  // ══════════ FREE REVISION NOTES & STUDY MATERIAL (VEDANTU) ══════════

  {
    title: 'Vedantu JEE Main Free Revision Notes (PDF)',
    type: 'Link', subject: 'General',
    url: 'https://www.vedantu.com/jee-main/revision-notes',
    tags: 'JEE Main, revision notes, free PDFs',
    note: 'Free JEE Main revision notes in PDF format, subject‑wise.',
    addedAt: new Date(0).toISOString()
  },
  {
    title: 'Vedantu JEE Advanced Revision Notes (PDF)',
    type: 'Link', subject: 'General',
    url: 'https://www.vedantu.com/jee-advanced/revision-notes',
    tags: 'JEE Advanced, revision notes, free PDFs',
    note: 'Free JEE Advanced revision notes in PDF format, subject‑wise.',
    addedAt: new Date(0).toISOString()
  },
  {
    title: 'Vedantu JEE Main Practice Papers (PDF)',
    type: 'Link', subject: 'General',
    url: 'https://www.vedantu.com/jee-main/practice-paper',
    tags: 'JEE Main, practice papers, free PDFs',
    note: 'Free downloadable JEE Main practice papers with solutions in PDF format.',
    addedAt: new Date(0).toISOString()
  },
  {
    title: 'Vedantu JEE Main Sample Papers (PDF)',
    type: 'Link', subject: 'General',
    url: 'https://www.vedantu.com/jee-main/sample-papers',
    tags: 'JEE Main, sample papers, free PDFs',
    note: 'Free downloadable JEE Main sample question papers with solutions.',
    addedAt: new Date(0).toISOString()
  },
  {
    title: 'Vedantu JEE Main Important Questions (PDF)',
    type: 'Link', subject: 'General',
    url: 'https://www.vedantu.com/jee-main/important-questions',
    tags: 'JEE Main, important questions, free PDFs',
    note: 'Free important questions with solutions for JEE Main in PDF.',
    addedAt: new Date(0).toISOString()
  },

  // ══════════ PER‑SUBJECT STUDY LINKS (Free) ══════════

  {
    title: 'JEE Main Physics Notes – PDF',
    type: 'Link', subject: 'Physics',
    url: 'https://www.vedantu.com/jee-main/physics-revision-notes',
    tags: 'JEE Main, Physics, notes, free PDFs',
    note: 'Free Physics revision notes for JEE Main in PDF format.',
    addedAt: new Date(0).toISOString()
  },

  // ══════════ MOCK TESTS & ONLINE PRACTICE ══════════

  {
    title: 'NTA Abhyas — Official JEE Main Mock Tests',
    type: 'Link', subject: 'General',
    url: 'https://nta.ac.in/Quiz',
    tags: 'JEE Main, official mock tests, free',
    note: 'Official National Testing Agency (NTA) mock tests for JEE Main.',
    addedAt: new Date(0).toISOString()
  },
  {
    title: 'SATHEE – Free JEE Main Crash Course & Tests',
    type: 'Link', subject: 'General',
    url: 'https://satheejee.iitk.ac.in/',
    tags: 'free mock tests, crash course, IIT Kanpur initiative',
    note: 'IIT Kanpur\'s free online JEE Main preparation with mock tests and practice problems.',
    addedAt: new Date(0).toISOString()
  },

  // ══════════ GLOBAL YOUTUBE LECTURES (Free & Verified) ══════════

  {
    title: 'Vedantu JEE YouTube Channel (Official)',
    type: 'Link', subject: 'General',
    url: 'https://www.youtube.com/@VedantuJEE',
    tags: 'JEE video lectures, physics, chemistry, maths',
    note: 'Free video lectures for JEE Main & Advanced topics.',
    addedAt: new Date(0).toISOString()
  },
  {
    title: 'Physics Galaxy YouTube Channel (Verified)',
    type: 'Link', subject: 'Physics',
    url: 'https://www.youtube.com/@PhysicsGalaxy',
    tags: 'Physics lectures, JEE Advanced',
    note: 'Free topic‑wise physics video lectures by a well‑known educator.',
    addedAt: new Date(0).toISOString()
  },

  // ══════════ MISCELLANEOUS STUDY HUB (FREE) ══════════

  {
    title: 'JEE Archive – Notes, Formula Sheets & More',
    type: 'Link', subject: 'General',
    url: 'https://jeearchive.in/',
    tags: 'JEE Archive, free notes, formula sheets, mock tests',
    note: 'Organized free study hub with notes, formula sheets and practice resources.',
    addedAt: new Date(0).toISOString()
  },
  {
    title: 'JEE Archive Misc Resources (Mock Tests & Formula Sheets)',
    type: 'Link', subject: 'General',
    url: 'https://jeearchive.in/miscellaneous.html',
    tags: 'formula sheets, mock tests, revision planners',
    note: 'Collection of high‑quality mock tests and formula sheets.',
    addedAt: new Date(0).toISOString()
  },

];

contextBridge.exposeInMainWorld('jee', {
  loadData:            ()                   => ipcRenderer.invoke('load-data'),
  saveData:            (data)               => ipcRenderer.invoke('save-data', data),
  sendNotification:    (title, body)        => ipcRenderer.invoke('send-notification', { title, body }),
  scheduleAlarms:      ()                   => ipcRenderer.invoke('schedule-alarms'),
  openExternal:        (url)                => ipcRenderer.invoke('open-external', url),
  aiDebate:            (payload, apiKey)    => ipcRenderer.invoke('ai-debate', { payload, apiKey }),
  minimize:            ()                   => ipcRenderer.invoke('minimize-app'),
  maximize:            ()                   => ipcRenderer.invoke('maximize-app'),
  close:               ()                   => ipcRenderer.invoke('close-app'),
  onAlarmFired:        (cb)                 => ipcRenderer.on('alarm-fired', (_, alarm) => cb(alarm)),
  getDefaultResources: ()                   => DEFAULT_RESOURCES,

  // ── Auto Updater ───────────────────────────────────────────────────────────
  onUpdateAvailable:   (cb)                 => ipcRenderer.on('update-available',  (_, d) => cb(d)),
  onUpdateProgress:    (cb)                 => ipcRenderer.on('update-progress',   (_, d) => cb(d)),
  onUpdateDownloaded:  (cb)                 => ipcRenderer.on('update-downloaded', (_, d) => cb(d)),
  quitAndInstall:      ()                   => ipcRenderer.invoke('quit-and-install'),
});