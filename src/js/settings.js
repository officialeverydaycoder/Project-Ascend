APP.pageInits['settings'] = {
  initialized: false,

  init() { this.render(); },
  refresh() { this.render(); },

  render() {
    const s = APP.data.settings || {};
    const pg = document.getElementById('page-settings');
    pg.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">Settings</div>
          <div class="page-subtitle">Configure API keys, alarms, and preferences</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="APP.pageInits.settings.save()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Save Settings
        </button>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;animation:fadeSlideUp 0.4s ease both">
        <!-- AI Config -->
        <div class="card">
          <div class="card-title" style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            HuggingFace AI Config
          </div>
          <div style="display:flex;flex-direction:column;gap:14px">
            <div class="input-group">
              <label class="input-label">HuggingFace API Key</label>
              <div style="position:relative">
                <input type="password" class="input" id="set-hfkey" placeholder="hf_..." value="${s.hfKey||''}" style="padding-right:44px">
                <button onclick="this.previousElementSibling.type=this.previousElementSibling.type==='password'?'text':'password'" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text3)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              <p style="font-size:11px;color:var(--text3);margin-top:4px">Get your free key at huggingface.co/settings/tokens</p>
            </div>
            <div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px">
              <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.06em">Models Used for Debate</div>
              ${['Mistral-7B-Instruct-v0.2','Zephyr-7B-Beta','Falcon-7B-Instruct','Flan-T5-XXL','Phi-2','Llama-2-7B-Chat','BLOOM-7B1'].map((m,i) =>
                `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--border)">
                  <div style="width:5px;height:5px;border-radius:50%;background:var(--green)"></div>
                  <span style="font-family:var(--font-mono);font-size:11px;color:var(--text2)">${m}</span>
                  <span style="font-size:10px;color:var(--text3);margin-left:auto">Free tier</span>
                </div>`).join('')}
            </div>
          </div>
        </div>

        <!-- Pomodoro Config -->
        <div class="card">
          <div class="card-title" style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 3M9 2h6M12 2v3"/></svg>
            Pomodoro Settings
          </div>
          <div style="display:flex;flex-direction:column;gap:14px">
            <div class="input-group">
              <label class="input-label">Work Duration (minutes)</label>
              <input type="number" class="input" id="set-pomo" placeholder="25" min="1" max="120" value="${s.pomoDuration||25}">
            </div>
            <div class="input-group">
              <label class="input-label">Short Break (minutes)</label>
              <input type="number" class="input" id="set-break" placeholder="5" min="1" max="30" value="${s.breakDuration||5}">
            </div>
            <div class="input-group">
              <label class="input-label">Long Break (minutes)</label>
              <input type="number" class="input" id="set-lbreak" placeholder="15" min="5" max="60" value="${s.longBreak||15}">
            </div>
            <div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg3);border-radius:8px;border:1px solid var(--border)">
              <input type="checkbox" id="set-alarm-sound" ${s.alarmSound!==false?'checked':''} style="width:16px;height:16px;cursor:pointer;accent-color:var(--indigo)">
              <label for="set-alarm-sound" style="font-size:13px;cursor:pointer">Play sound on alarm</label>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="card">
          <div class="card-title" style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            Notifications
          </div>
          <div style="background:rgba(57,233,123,0.08);border:1px solid rgba(57,233,123,0.2);border-radius:8px;padding:12px;margin-bottom:14px">
            <div style="font-size:12px;font-weight:600;color:var(--green);margin-bottom:4px">Focus Assist Bypass Active</div>
            <div style="font-size:11px;color:var(--text3)">This app runs as Administrator and uses Windows Toast API directly, bypassing Focus Assist and Do Not Disturb.</div>
          </div>
          <button class="btn btn-ghost" style="width:100%;justify-content:center;margin-bottom:12px" onclick="APP.pageInits.settings.testNotif()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            Test Notification
          </button>
          <div style="display:flex;flex-direction:column;gap:8px">
            <div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg3);border-radius:8px;border:1px solid var(--border)">
              <input type="checkbox" id="set-notif-task" ${s.notifTask!==false?'checked':''} style="width:16px;height:16px;cursor:pointer;accent-color:var(--indigo)">
              <label for="set-notif-task" style="font-size:13px;cursor:pointer">Notify on task completion</label>
            </div>
            <div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg3);border-radius:8px;border:1px solid var(--border)">
              <input type="checkbox" id="set-notif-pomo" ${s.notifPomo!==false?'checked':''} style="width:16px;height:16px;cursor:pointer;accent-color:var(--indigo)">
              <label for="set-notif-pomo" style="font-size:13px;cursor:pointer">Notify on Pomodoro cycle end</label>
            </div>
          </div>
        </div>

        <!-- Alarms -->
        <div class="card">
          <div class="card-title" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <div style="display:flex;align-items:center;gap:8px">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 3"/><path d="M5 3L2 6M22 6l-3-3"/></svg>
              Alarms & Reminders
            </div>
            <button class="btn btn-ghost btn-sm" onclick="APP.pageInits.settings.addAlarm()">Add Alarm</button>
          </div>
          <div id="alarms-list" style="display:flex;flex-direction:column;gap:8px;max-height:300px;overflow-y:auto"></div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="card" style="margin-top:20px;animation:fadeSlideUp 0.4s ease 0.2s both">
        <div class="card-title" style="margin-bottom:16px">Data Management</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" onclick="APP.pageInits.settings.exportData()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Data (JSON)
          </button>
          <button class="btn btn-danger btn-sm" onclick="APP.pageInits.settings.clearData()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Clear All Data
          </button>
        </div>
      </div>
    `;
    this.renderAlarms();
  },

  renderAlarms() {
    const el = document.getElementById('alarms-list');
    if (!el) return;
    const alarms = APP.data.alarms || [];
    if (!alarms.length) {
      el.innerHTML = '<div style="font-size:12px;color:var(--text3);text-align:center;padding:20px 0">No alarms set</div>';
      return;
    }
    el.innerHTML = alarms.map((a, i) => `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg3);border-radius:8px;border:1px solid var(--border)">
        <input type="checkbox" ${a.enabled?'checked':''} style="width:14px;height:14px;accent-color:var(--indigo);cursor:pointer" onchange="APP.pageInits.settings.toggleAlarm(${i})">
        <div style="flex:1">
          <div style="font-family:var(--font-mono);font-size:14px;font-weight:600;color:${a.enabled?'var(--text)':'var(--text3)'}">${a.time}</div>
          <div style="font-size:11px;color:var(--text3)">${a.label||'Alarm'}</div>
        </div>
        <button class="btn btn-danger btn-sm" style="padding:4px 8px" onclick="APP.pageInits.settings.deleteAlarm(${i})">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
        </button>
      </div>`).join('');
  },

  addAlarm() {
    openModal(`
      <div class="modal-header">
        <div class="modal-title">Add Alarm</div>
        <div class="modal-close" onclick="closeModal()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="input-group">
          <label class="input-label">Time</label>
          <input type="time" class="input" id="al-time" style="font-family:var(--font-mono);font-size:18px">
        </div>
        <div class="input-group">
          <label class="input-label">Label</label>
          <input class="input" id="al-label" placeholder="e.g. Morning Study Session">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="APP.pageInits.settings.saveAlarm()">Add Alarm</button>
      </div>
    `);
  },

  saveAlarm() {
    const time = document.getElementById('al-time').value;
    if (!time) { toast('Set a time', 'error'); return; }
    APP.data.alarms.push({ time, label: document.getElementById('al-label').value, enabled: true });
    saveData(); window.jee.scheduleAlarms();
    closeModal(); this.renderAlarms(); toast('Alarm added!', 'success');
  },

  toggleAlarm(i) { APP.data.alarms[i].enabled = !APP.data.alarms[i].enabled; saveData(); window.jee.scheduleAlarms(); },
  deleteAlarm(i) { APP.data.alarms.splice(i, 1); saveData(); window.jee.scheduleAlarms(); this.renderAlarms(); toast('Alarm deleted'); },

  testNotif() {
    window.jee.sendNotification('Project Ascend', 'Notifications are working! Focus Assist bypassed.');
    toast('Test notification sent!', 'success');
  },

  save() {
    APP.data.settings = {
      hfKey:        document.getElementById('set-hfkey').value.trim(),
      pomoDuration: parseInt(document.getElementById('set-pomo').value)||25,
      breakDuration: parseInt(document.getElementById('set-break').value)||5,
      longBreak:    parseInt(document.getElementById('set-lbreak').value)||15,
      alarmSound:   document.getElementById('set-alarm-sound').checked,
      notifTask:    document.getElementById('set-notif-task').checked,
      notifPomo:    document.getElementById('set-notif-pomo').checked,
    };
    saveData(); window.jee.scheduleAlarms();
    toast('Settings saved!', 'success');
  },

  exportData() {
    const blob = new Blob([JSON.stringify(APP.data, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `jee-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast('Data exported!', 'success');
  },

  clearData() {
    if (!confirm('Clear ALL data? This cannot be undone!')) return;
    APP.data = { tasks:[], mocks:[], resources:[], sessions:[], alarms:[], settings: APP.data.settings||{}, calendar:{} };
    saveData(); this.render(); toast('All data cleared', 'error');
  }
};
