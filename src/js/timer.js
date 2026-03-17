APP.pageInits['timer'] = {
  initialized: false,
  mode: 'stopwatch',        // 'stopwatch' | 'countdown' | 'pomodoro'
  running: false,
  elapsed: 0,               // ms
  countdownTotal: 0,        // ms
  countdownRemaining: 0,    // ms
  pomoCycle: 0,             // 0=work, 1=break
  pomoCount: 0,
  interval: null,
  lastTick: null,
  sessionTask: null,

  init() { this.render(); },
  refresh() {},

  render() {
    const pg = document.getElementById('page-timer');
    pg.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">Timer & Pomodoro</div>
          <div class="page-subtitle">Focus sessions with optional Pomodoro technique</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 360px;gap:20px;align-items:start">
        <!-- Timer Card -->
        <div class="card" style="animation:fadeSlideUp 0.4s ease both">
          <!-- Mode Tabs -->
          <div class="tab-bar" style="margin-bottom:24px">
            <button class="tab-btn ${this.mode==='stopwatch'?'active':''}" onclick="APP.pageInits.timer.setMode('stopwatch')">Stopwatch</button>
            <button class="tab-btn ${this.mode==='countdown'?'active':''}" onclick="APP.pageInits.timer.setMode('countdown')">Countdown</button>
            <button class="tab-btn ${this.mode==='pomodoro'?'active':''}" onclick="APP.pageInits.timer.setMode('pomodoro')">Pomodoro</button>
          </div>

          <!-- Timer Ring -->
          <div style="display:flex;justify-content:center;margin:20px 0 28px">
            <div style="position:relative;width:220px;height:220px">
              <svg viewBox="0 0 220 220" style="position:absolute;inset:0;transform:rotate(-90deg)">
                <circle cx="110" cy="110" r="100" fill="none" stroke="var(--bg3)" stroke-width="8"/>
                <circle cx="110" cy="110" r="100" fill="none" stroke="var(--indigo)" stroke-width="8"
                  stroke-dasharray="628.3" stroke-dashoffset="628.3" stroke-linecap="round"
                  id="timer-ring" style="transition: stroke-dashoffset 0.5s ease, stroke 0.4s ease"/>
                <!-- Glow effect -->
                <circle cx="110" cy="110" r="100" fill="none" stroke="var(--indigo)" stroke-width="2"
                  stroke-dasharray="628.3" stroke-dashoffset="628.3" id="timer-ring-glow"
                  style="filter:blur(4px);opacity:0.5;transition: stroke-dashoffset 0.5s ease"/>
              </svg>
              <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
                <div id="timer-display" style="font-family:var(--font-mono);font-size:38px;font-weight:700;color:var(--text);letter-spacing:0.04em;transition:all 0.3s">00:00:00</div>
                <div id="timer-label" style="font-size:12px;color:var(--text3);margin-top:4px;font-weight:500">Ready</div>
                <div id="pomo-cycles" style="font-size:11px;color:var(--indigo2);margin-top:4px;font-family:var(--font-mono);display:none"></div>
              </div>
            </div>
          </div>

          <!-- Countdown Input -->
          <div id="countdown-input" style="display:none;justify-content:center;gap:10px;margin-bottom:20px">
            <div class="input-group" style="width:80px;align-items:center">
              <label class="input-label" style="text-align:center">Hours</label>
              <input type="number" class="input" id="cd-h" placeholder="0" min="0" max="23" style="text-align:center;font-family:var(--font-mono)">
            </div>
            <div class="input-group" style="width:80px;align-items:center">
              <label class="input-label" style="text-align:center">Minutes</label>
              <input type="number" class="input" id="cd-m" placeholder="45" min="0" max="59" style="text-align:center;font-family:var(--font-mono)">
            </div>
            <div class="input-group" style="width:80px;align-items:center">
              <label class="input-label" style="text-align:center">Seconds</label>
              <input type="number" class="input" id="cd-s" placeholder="0" min="0" max="59" style="text-align:center;font-family:var(--font-mono)">
            </div>
          </div>

          <!-- Pomodoro Config -->
          <div id="pomo-config" style="display:none;justify-content:center;gap:16px;margin-bottom:20px;font-size:12px;color:var(--text3)">
            <span>Work: <b style="color:var(--indigo2);font-family:var(--font-mono)" id="pomo-work-label">${APP.data.settings?.pomoDuration||25}m</b></span>
            <span>Break: <b style="color:var(--green);font-family:var(--font-mono)" id="pomo-break-label">${APP.data.settings?.breakDuration||5}m</b></span>
            <span style="color:var(--text3)">Cycle <span id="pomo-cycle-label" style="color:var(--amber);font-weight:600;font-family:var(--font-mono)">—</span></span>
          </div>

          <!-- Task Tag -->
          <div style="display:flex;justify-content:center;margin-bottom:20px">
            <select class="select" id="timer-task" style="width:260px;text-align:center">
              <option value="">— Select task to track —</option>
              ${(APP.data.tasks||[]).filter(t=>t.status!=='done').map(t=>`<option value="${t.id}">${t.title} (${t.subject})</option>`).join('')}
            </select>
          </div>

          <!-- Controls -->
          <div style="display:flex;justify-content:center;gap:12px">
            <button id="btn-start" class="btn btn-primary" style="min-width:100px;font-size:15px;padding:12px 24px" onclick="APP.pageInits.timer.toggle()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Start
            </button>
            <button class="btn btn-ghost" style="padding:12px 20px" onclick="APP.pageInits.timer.reset()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
            </button>
            <button class="btn btn-ghost" style="padding:12px 20px" onclick="APP.pageInits.timer.lap()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><circle cx="12" cy="12" r="2"/></svg>
            </button>
          </div>
        </div>

        <!-- Right Panel -->
        <div style="display:flex;flex-direction:column;gap:16px;animation:fadeSlideUp 0.4s ease 0.1s both">
          <!-- Today's Sessions -->
          <div class="card">
            <div class="card-title">Today's Sessions</div>
            <div id="sessions-list" style="display:flex;flex-direction:column;gap:8px;max-height:250px;overflow-y:auto"></div>
          </div>

          <!-- Laps -->
          <div class="card">
            <div class="card-title" style="display:flex;justify-content:space-between;align-items:center">
              Laps
              <button class="btn btn-ghost btn-sm" onclick="APP.pageInits.timer.clearLaps()">Clear</button>
            </div>
            <div id="laps-list" style="display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto">
              <div style="font-size:12px;color:var(--text3);text-align:center;padding:20px 0">No laps yet</div>
            </div>
          </div>
        </div>
      </div>
    `;
    this.updateModeUI();
    this.renderSessions();
    this.renderLaps();
  },

  setMode(mode) {
    if (this.running) this.stop();
    this.mode = mode;
    this.elapsed = 0;
    this.render();
  },

  updateModeUI() {
    const cdInput = document.getElementById('countdown-input');
    const pomoConfig = document.getElementById('pomo-config');
    if (cdInput) cdInput.style.display = this.mode === 'countdown' ? 'flex' : 'none';
    if (pomoConfig) pomoConfig.style.display = this.mode === 'pomodoro' ? 'flex' : 'none';
    this.updateDisplay();
    this.updateRing();
  },

  toggle() {
    if (this.running) this.stop();
    else this.start();
  },

  start() {
    if (this.mode === 'countdown' && this.countdownRemaining === 0) {
      const h = parseInt(document.getElementById('cd-h')?.value)||0;
      const m = parseInt(document.getElementById('cd-m')?.value)||45;
      const s = parseInt(document.getElementById('cd-s')?.value)||0;
      this.countdownTotal = (h*3600+m*60+s)*1000;
      this.countdownRemaining = this.countdownTotal;
      if (!this.countdownTotal) { toast('Set a duration', 'error'); return; }
    }
    if (this.mode === 'pomodoro' && this.elapsed === 0 && this.countdownRemaining === 0) {
      const workMs = (APP.data.settings?.pomoDuration||25)*60*1000;
      this.countdownTotal = workMs;
      this.countdownRemaining = workMs;
      this.pomoCycle = 0;
      document.getElementById('pomo-cycle-label').textContent = 'Work';
    }

    this.running = true;
    this.lastTick = Date.now();
    const btn = document.getElementById('btn-start');
    if (btn) {
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause`;
      btn.style.background = 'rgba(255,179,71,0.2)'; btn.style.color = 'var(--amber)';
      btn.style.border = '1px solid rgba(255,179,71,0.3)'; btn.style.boxShadow = 'none';
    }
    document.getElementById('timer-label').textContent = this.mode === 'pomodoro' ? (this.pomoCycle===0?'Focus':'Break') : 'Running';
    document.getElementById('timer-label').style.color = 'var(--green)';
    this.interval = setInterval(() => this.tick(), 100);
  },

  tick() {
    const now = Date.now();
    const delta = now - this.lastTick;
    this.lastTick = now;

    if (this.mode === 'stopwatch') {
      this.elapsed += delta;
    } else if (this.mode === 'countdown' || this.mode === 'pomodoro') {
      this.countdownRemaining -= delta;
      if (this.countdownRemaining <= 0) {
        this.countdownRemaining = 0;
        this.onCountdownEnd();
        return;
      }
    }
    this.updateDisplay();
    this.updateRing();
  },

  onCountdownEnd() {
    this.stop();
    if (this.mode === 'pomodoro') {
      window.jee.sendNotification('Pomodoro', this.pomoCycle===0 ? '25 min done! Take a break.' : 'Break over! Back to work.');
      toast(this.pomoCycle===0 ? 'Work session done! Take a break.' : 'Break done! Start next session.', 'success');
      this.logSession(this.countdownTotal);
      this.pomoCycle = this.pomoCycle===0 ? 1 : 0;
      if (this.pomoCycle===0) this.pomoCount++;
      const workMs  = (APP.data.settings?.pomoDuration||25)*60*1000;
      const breakMs = (APP.data.settings?.breakDuration||5)*60*1000;
      this.countdownTotal = this.pomoCycle===0 ? workMs : breakMs;
      this.countdownRemaining = this.countdownTotal;
      document.getElementById('pomo-cycle-label').textContent = this.pomoCycle===0?'Work':'Break';
      document.getElementById('pomo-cycles').textContent = `${this.pomoCount} cycles done`;
      document.getElementById('pomo-cycles').style.display = 'block';
      this.updateDisplay(); this.updateRing();
    } else {
      window.jee.sendNotification('Timer Done', 'Your countdown finished!');
      toast('Countdown finished!', 'success');
      this.logSession(this.countdownTotal);
    }
  },

  stop() {
    clearInterval(this.interval);
    this.running = false;
    const btn = document.getElementById('btn-start');
    if (btn) {
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Start`;
      btn.style = '';
      btn.className = 'btn btn-primary';
      btn.style.minWidth = '100px'; btn.style.fontSize = '15px'; btn.style.padding = '12px 24px';
    }
    document.getElementById('timer-label').textContent = 'Paused';
    document.getElementById('timer-label').style.color = 'var(--amber)';
    if (this.mode === 'stopwatch' && this.elapsed > 1000) {
      this.logSession(this.elapsed);
      this.elapsed = 0;
      this.updateDisplay(); this.updateRing();
    }
  },

  reset() {
    this.stop();
    this.elapsed = 0; this.countdownRemaining = 0; this.pomoCycle = 0; this.pomoCount = 0;
    document.getElementById('timer-label').textContent = 'Ready';
    document.getElementById('timer-label').style.color = 'var(--text3)';
    this.updateDisplay(); this.updateRing();
    this.render();
  },

  logSession(durationMs) {
    const taskId = document.getElementById('timer-task')?.value;
    const task = taskId ? APP.data.tasks.find(t => t.id == taskId) : null;
    APP.data.sessions.push({
      subject: task?.subject || 'General',
      task: task?.title,
      duration: Math.round(durationMs / 60000),
      questions: 0,
      date: new Date().toISOString()
    });
    saveData(); this.renderSessions();
    toast(`Session logged: ${Math.round(durationMs/60000)} min`, 'success');
  },

  lap() {
    if (!this.running && this.elapsed === 0) return;
    const t = this.mode === 'stopwatch' ? this.elapsed : this.countdownTotal - this.countdownRemaining;
    const laps = document.getElementById('laps-list');
    const count = laps.querySelectorAll('.lap-item').length + 1;
    if (count === 1) laps.innerHTML = '';
    const item = document.createElement('div');
    item.className = 'lap-item';
    item.style.cssText = 'display:flex;justify-content:space-between;padding:6px 8px;background:var(--bg3);border-radius:6px;border:1px solid var(--border);animation:fadeSlideUp 0.3s ease both';
    item.innerHTML = `<span style="font-size:11px;color:var(--text3)">Lap ${count}</span><span style="font-family:var(--font-mono);font-size:11px;color:var(--text)">${this.fmtMs(t)}</span>`;
    laps.insertBefore(item, laps.firstChild);
  },

  clearLaps() {
    document.getElementById('laps-list').innerHTML = '<div style="font-size:12px;color:var(--text3);text-align:center;padding:20px 0">No laps yet</div>';
  },

  fmtMs(ms) {
    const h = Math.floor(ms/3600000);
    const m = Math.floor((ms%3600000)/60000);
    const s = Math.floor((ms%60000)/1000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  },

  updateDisplay() {
    const el = document.getElementById('timer-display');
    if (!el) return;
    let ms = this.mode === 'stopwatch' ? this.elapsed : this.countdownRemaining;
    el.textContent = this.fmtMs(ms);
  },

  updateRing() {
    const ring = document.getElementById('timer-ring');
    const glow = document.getElementById('timer-ring-glow');
    if (!ring) return;
    const circumference = 628.3;
    let pct = 0;
    if (this.mode === 'stopwatch') {
      pct = Math.min((this.elapsed % 3600000) / 3600000, 1);
    } else {
      pct = this.countdownTotal > 0 ? 1 - this.countdownRemaining / this.countdownTotal : 0;
    }
    const offset = circumference * (1 - pct);
    ring.style.strokeDashoffset = offset;
    if (glow) glow.style.strokeDashoffset = offset;
    const color = this.mode === 'pomodoro' && this.pomoCycle === 1 ? 'var(--green)' :
                  pct > 0.8 ? 'var(--amber)' : 'var(--indigo)';
    ring.style.stroke = color;
    if (glow) glow.style.stroke = color;
  },

  renderSessions() {
    const el = document.getElementById('sessions-list');
    if (!el) return;
    const today = new Date().toDateString();
    const sessions = (APP.data.sessions||[]).filter(s => new Date(s.date).toDateString()===today).reverse().slice(0,8);
    if (!sessions.length) { el.innerHTML = '<div style="font-size:12px;color:var(--text3);text-align:center;padding:20px 0">No sessions today</div>'; return; }
    el.innerHTML = sessions.map(s => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:var(--bg3);border-radius:8px;border:1px solid var(--border)">
        <div>
          <div style="font-size:12px;font-weight:500">${s.task||s.subject}</div>
          <div style="font-size:10px;color:var(--text3)">${new Date(s.date).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
        </div>
        <span style="font-family:var(--font-mono);font-size:12px;color:var(--cyan)">${s.duration}m</span>
      </div>`).join('');
  },

  renderLaps() {
    const el = document.getElementById('laps-list');
    if (!el) return;
  }
};
