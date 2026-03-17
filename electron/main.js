const { app, BrowserWindow, ipcMain, Tray, Menu, shell, screen, nativeImage } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const { execSync, exec } = require('child_process');

// ── Suppress GPU cache errors ─────────────────────────────────────────────────
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-software-rasterizer');

let mainWindow, tray;
const dataPath = path.join(app.getPath('userData'), 'jee-data.json');

// ── Data Store ──────────────────────────────────────────────────────────────
function loadData() {
  try { return JSON.parse(fs.readFileSync(dataPath, 'utf8')); }
  catch { return { tasks: [], mocks: [], resources: [], settings: { hfKey: '', pomoDuration: 25, breakDuration: 5 }, sessions: [], alarms: [] }; }
}
function saveData(data) { fs.writeFileSync(dataPath, JSON.stringify(data, null, 2)); }

// ── Windows Notification Bypass (bypasses Focus Assist via PowerShell) ──────
function sendNativeNotification(title, body) {
  const ps = `
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
$template = @"
<toast>
  <visual><binding template="ToastGeneric">
    <text>${title.replace(/"/g, '')}</text>
    <text>${body.replace(/"/g, '')}</text>
  </binding></visual>
  <audio src="ms-winsoundevent:Notification.Reminder"/>
</toast>
"@
$xml = New-Object Windows.Data.Xml.Dom.XmlDocument
$xml.LoadXml($template)
$toast = New-Object Windows.UI.Notifications.ToastNotification $xml
$toast.Priority = [Windows.UI.Notifications.ToastNotificationPriority]::High
$notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Project Ascend")
$notifier.Show($toast)
`;
  try { execSync(`powershell -NoProfile -NonInteractive -Command "${ps.replace(/\n/g,' ').replace(/"/g,'\\"')}"`, { windowsHide: true }); }
  catch (e) {
    const { Notification } = require('electron');
    if (Notification.isSupported()) new Notification({ title, body, urgency: 'critical' }).show();
  }
}

// ── Alarm Scheduler ──────────────────────────────────────────────────────────
let alarmIntervals = [];
function scheduleAlarms() {
  alarmIntervals.forEach(t => clearInterval(t));
  alarmIntervals = [];
  const data = loadData();
  data.alarms.forEach(alarm => {
    if (!alarm.enabled) return;
    const check = setInterval(() => {
      const now = new Date();
      const [h, m] = alarm.time.split(':').map(Number);
      if (now.getHours() === h && now.getMinutes() === m && now.getSeconds() < 3) {
        sendNativeNotification('JEE Alarm', alarm.label || 'Time to study!');
        if (mainWindow) mainWindow.webContents.send('alarm-fired', alarm);
      }
    }, 1000);
    alarmIntervals.push(check);
  });
}

// ── Multi-AI Debate Engine ────────────────────────────────────────────────────
const HF_MODELS = [
  { id: 'google/flan-t5-large', name: 'Flan-T5 Large (Google)', type: 'seq2seq' },
  { id: 'google/flan-t5-base',  name: 'Flan-T5 Base (Google)',  type: 'seq2seq' },
  { id: 'google/flan-t5-small', name: 'Flan-T5 Small (Google)', type: 'seq2seq' },
  { id: 'statistical-model-a',  name: 'JEE Statistical Model A', type: 'formula' },
  { id: 'statistical-model-b',  name: 'JEE Statistical Model B', type: 'formula' },
  { id: 'statistical-model-c',  name: 'JEE Statistical Model C', type: 'formula' },
  { id: 'statistical-model-d',  name: 'JEE Statistical Model D', type: 'formula' },
];

function formulaRank(percentile, score, catMult, genderMult, seed) {
  const TOTAL = 1250000;
  let pct = percentile;
  if (!pct && score) {
    const pts = [[300,100],[285,99.99],[270,99.97],[255,99.9],[240,99.7],
                 [225,99.4],[210,99.0],[195,98.2],[180,97],[165,95],
                 [150,92],[135,87],[120,79],[100,68],[80,53],[60,37],[40,20],[0,0]];
    for (let i=0;i<pts.length-1;i++) {
      if (score >= pts[i+1][0]) {
        const t = (score - pts[i+1][0]) / (pts[i][0] - pts[i+1][0]);
        pct = pts[i+1][1] + t * (pts[i][1] - pts[i+1][1]);
        break;
      }
    }
  }
  if (!pct) return null;
  const baseRank  = Math.round(TOTAL * (1 - pct / 100));
  const catRank   = Math.round(baseRank * catMult);
  const finalRank = Math.round(catRank * genderMult);
  const jitter    = 1 + Math.sin(seed * 13.7 + pct * 0.3) * 0.07;
  return Math.max(1, Math.round(finalRank * jitter));
}

async function queryFlanT5(modelId, prompt, apiKey) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 60, do_sample: false } }),
      signal: ctrl.signal
    });
    clearTimeout(timer);
    if (!res.ok) {
      const txt = await res.text().catch(()=>'');
      throw new Error(`HTTP ${res.status} — ${txt.slice(0,100)}`);
    }
    const json = await res.json();
    if (Array.isArray(json)) return json[0]?.generated_text || '';
    if (json.error) throw new Error(json.error);
    return json?.generated_text || JSON.stringify(json);
  } catch(e) {
    clearTimeout(timer);
    throw e;
  }
}

async function runAIDebate(payload, apiKey) {
  const { percentile, score, category, gender } = payload;
  const catMult    = {'General':1.0,'OBC-NCL':0.70,'SC':0.43,'ST':0.36,'EWS':0.88}[category] || 1.0;
  const genderMult = gender === 'Female' ? 0.95 : 1.0;
  const pctVal     = percentile || 0;
  const prompt     = `Question: A student scored ${pctVal} percentile in JEE Main exam with ${score||'unknown'} marks out of 300. What is the expected JEE Advanced rank? Answer with just the number.`;
  const responses  = [];

  for (let i = 0; i < HF_MODELS.length; i++) {
    const m             = HF_MODELS[i];
    const formulaResult = formulaRank(percentile, score, catMult, genderMult, i);

    if (m.type === 'seq2seq' && apiKey && apiKey.startsWith('hf_')) {
      try {
        const text      = await queryFlanT5(m.id, prompt, apiKey);
        const cleaned   = text.replace(/,/g,'').replace(/[^0-9\s]/g,' ');
        const nums      = cleaned.match(/\d{2,7}/g) || [];
        const valid     = nums.map(Number).filter(n => n > 50 && n < 2000000);
        const extracted = valid.length ? valid[0] : null;
        const rank      = (extracted && Math.abs(extracted - formulaResult) / formulaResult < 3)
          ? extracted : formulaResult;
        responses.push({ model: m.name, modelId: m.id, response: text || String(rank), rank, status: 'ok' });
      } catch (e) {
        responses.push({ model: m.name, modelId: m.id, response: String(formulaResult), rank: formulaResult, status: 'formula', error: e.message });
      }
    } else {
      await new Promise(r => setTimeout(r, 200 + Math.random() * 600));
      responses.push({ model: m.name, modelId: m.id, response: String(formulaResult), rank: formulaResult, status: 'formula' });
    }
  }

  const ranks   = responses.map(r=>r.rank).filter(Boolean).sort((a,b)=>a-b);
  let consensus = null;
  if (ranks.length >= 5) {
    const trimmed = ranks.slice(1,-1);
    consensus = Math.round(trimmed.reduce((a,b)=>a+b,0)/trimmed.length);
  } else if (ranks.length > 0) {
    consensus = Math.round(ranks.reduce((a,b)=>a+b,0)/ranks.length);
  }

  return {
    responses,
    consensus,
    successCount: responses.filter(r=>r.status==='ok').length,
    formulaCount: responses.filter(r=>r.status==='formula').length,
    total: HF_MODELS.length
  };
}

// ── Auto Updater ──────────────────────────────────────────────────────────────
function setupAutoUpdater() {
  if (!app.isPackaged) return; // skip in dev

  autoUpdater.autoDownload         = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available',  (info) => {
    sendNativeNotification('Project Ascend Update', `v${info.version} is downloading...`);
    mainWindow?.webContents.send('update-available', { version: info.version });
  });

  autoUpdater.on('download-progress', (p) => {
    mainWindow?.webContents.send('update-progress', { percent: Math.round(p.percent) });
  });

  autoUpdater.on('update-downloaded', (info) => {
    sendNativeNotification('Update Ready', `v${info.version} downloaded. Restart to install.`);
    mainWindow?.webContents.send('update-downloaded', { version: info.version });
  });

  autoUpdater.on('error', (err) => {
    console.error('[Updater]', err.message);
  });

  // Check 5s after launch, then every 2 hours
  setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 5000);
  setInterval(()  => autoUpdater.checkForUpdates().catch(() => {}), 2 * 60 * 60 * 1000);
}

// ── IPC Handlers ──────────────────────────────────────────────────────────────
ipcMain.handle('load-data',         ()                => loadData());
ipcMain.handle('save-data',         (_, data)         => { saveData(data); return true; });
ipcMain.handle('send-notification', (_, { title, body }) => { sendNativeNotification(title, body); return true; });
ipcMain.handle('schedule-alarms',   ()                => { scheduleAlarms(); return true; });
ipcMain.handle('open-external',     (_, url)          => { shell.openExternal(url); return true; });
ipcMain.handle('minimize-app',      ()                => { mainWindow?.minimize(); });
ipcMain.handle('maximize-app',      ()                => { mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize(); });
ipcMain.handle('close-app',         ()                => { mainWindow?.hide(); });
ipcMain.handle('quit-and-install',  ()                => { autoUpdater.quitAndInstall(); });
ipcMain.handle('ai-debate', async (_, { payload, apiKey }) => {
  try { return await runAIDebate(payload, apiKey); }
  catch(e) { return { error: e.message, responses: [], consensus: null, successCount: 0, total: 7 }; }
});

// ── Create Window ─────────────────────────────────────────────────────────────
function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    width: Math.min(1440, width), height: Math.min(920, height),
    minWidth: 1100, minHeight: 700,
    frame: false, transparent: false,
    backgroundColor: '#08080f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false,
      webviewTag: true
    },
    show: false,
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, '../src/assets/icons/icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, '../src/index.html'));
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    scheduleAlarms();
    setupAutoUpdater();
  });

  mainWindow.on('close', (e) => {
    e.preventDefault();
    mainWindow.hide();
  });
}

// ── Tray ──────────────────────────────────────────────────────────────────────
function createTray() {
  const iconPath = path.join(__dirname, '../src/assets/icons/tray.png');
  try {
    tray = new Tray(iconPath);
  } catch {
    tray = new Tray(nativeImage.createEmpty());
  }
  const menu = Menu.buildFromTemplate([
    { label: 'Open Project Ascend', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'Check for Updates', click: () => {
        if (app.isPackaged) autoUpdater.checkForUpdates().catch(() => {});
      }
    },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.exit(0); } }
  ]);
  tray.setToolTip('Project Ascend');
  tray.setContextMenu(menu);
  tray.on('click', () => mainWindow?.show());
}

app.whenReady().then(() => { createWindow(); createTray(); });
app.on('window-all-closed', (e) => e.preventDefault());
app.on('activate', () => mainWindow?.show());