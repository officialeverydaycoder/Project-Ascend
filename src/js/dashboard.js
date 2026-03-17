/* ══════════════════════════════════════════════════
   DASHBOARD — Animated stats · Charts · Quick log
══════════════════════════════════════════════════ */
APP.pageInits['dashboard'] = {
  initialized: false,

  init()    { this.render(); },
  refresh() { this.render(); },

  render() {
    const pg = document.getElementById('page-dashboard');
    const today = new Date();

    pg.innerHTML = `
      <div class="page-header s1" style="animation:fadeSlideUp 0.45s var(--expo) both">
        <div>
          <div class="page-title">Command Center</div>
          <div class="page-subtitle">${today.toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn btn-ghost btn-sm" onclick="APP.pageInits.dashboard.quickLog()" style="gap:6px">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Log Session
          </button>
        </div>
      </div>

      <!-- ── Stat Grid ── -->
      <div class="stat-grid" id="stat-grid">
        ${this.statCard('stat-tasks','0','Tasks Today','<svg viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>','rgba(108,99,255,0.12)','radial-gradient(circle at 0 0, var(--indigo), transparent 70%)','+0','up','s1')}
        ${this.statCard('stat-time','0h','Study Today','<svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>','rgba(61,232,122,0.10)','radial-gradient(circle at 0 0, var(--green), transparent 70%)','+0h','up','s2')}
        ${this.statCard('stat-qs','0','Questions Done','<svg viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>','rgba(56,232,245,0.10)','radial-gradient(circle at 0 0, var(--cyan), transparent 70%)','+0','up','s3')}
        ${this.statCard('stat-streak','0','Day Streak','<svg viewBox="0 0 24 24" fill="var(--amber)"><path d="M12 2C9 6 4 9 4 14a8 8 0 0016 0c0-5-5-8-8-12z"/></svg>','rgba(255,179,64,0.10)','radial-gradient(circle at 0 0, var(--amber), transparent 70%)','','','s4')}
      </div>

      <!-- ── Charts Row ── -->
      <div class="grid-2" style="margin-bottom:18px;animation:fadeSlideUp 0.5s var(--expo) 0.15s both">
        <div class="card" style="height:230px">
          <div class="card-title">Weekly Study Hours</div>
          <canvas id="chart-weekly" style="max-height:185px"></canvas>
        </div>
        <div class="card" style="height:230px">
          <div class="card-title">Questions per Day</div>
          <canvas id="chart-questions" style="max-height:185px"></canvas>
        </div>
      </div>

      <!-- ── Bottom Row ── -->
      <div class="grid-3" style="animation:fadeSlideUp 0.5s var(--expo) 0.25s both">
        <div class="card">
          <div class="card-title">Subject Split</div>
          <div style="height:150px;display:flex;align-items:center;justify-content:center;position:relative">
            <canvas id="chart-subjects" width="150" height="150"></canvas>
            <div id="doughnut-center" style="position:absolute;text-align:center;pointer-events:none">
              <div style="font-family:var(--font-mono);font-size:18px;font-weight:700;color:var(--text)" id="doughnut-num">0</div>
              <div style="font-size:10px;color:var(--text3)">tasks</div>
            </div>
          </div>
          <div id="subject-legend" style="margin-top:10px;display:flex;flex-direction:column;gap:5px"></div>
        </div>

        <div class="card">
          <div class="card-title">Recent Mocks</div>
          <div id="recent-mocks-list" style="display:flex;flex-direction:column;gap:7px;max-height:230px;overflow-y:auto"></div>
        </div>

        <div class="card">
          <div class="card-title">Today's Tasks</div>
          <div id="today-tasks-list" style="display:flex;flex-direction:column;gap:7px;max-height:230px;overflow-y:auto"></div>
        </div>
      </div>

      <!-- Rank Banner -->
      <div id="rank-banner" style="margin-top:16px;display:none;animation:fadeSlideUp 0.5s var(--expo) 0.35s both">
        <div class="card" style="background:linear-gradient(135deg,rgba(108,99,255,0.12),rgba(168,85,247,0.07));border-color:rgba(108,99,255,0.28)">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div>
              <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px">AI Predicted Rank</div>
              <div style="font-family:var(--font-mono);font-size:34px;font-weight:800;color:var(--indigo2);animation:bounceIn 0.6s var(--spring)" id="rank-pred-val">—</div>
              <div style="font-size:11px;color:var(--text3);margin-top:4px" id="rank-pred-sub">Based on recent mocks · 7 AI models</div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="navigateTo('rank')">Full Estimator →</button>
          </div>
        </div>
      </div>
    `;

    this.attachTilt();
    this.populateStats();
    this.renderCharts();
    this.renderRecentMocks();
    this.renderTodayTasks();
  },

  statCard(id, val, label, iconSvg, iconBg, glowBg, delta, deltaType, delay) {
    return `
      <div class="stat-card ${delay}" style="animation-fill-mode:both">
        <div class="glow-bg" style="background:${glowBg}"></div>
        <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${iconBg.replace('0.12)','0.6)').replace('0.10)','0.4)')},transparent);opacity:0;transition:opacity 0.3s" class="top-shine"></div>
        <div class="stat-icon" style="background:${iconBg}">${iconSvg}</div>
        <div class="stat-val" id="${id}">${val}</div>
        <div class="stat-label">${label}</div>
        ${delta ? `<div class="stat-delta delta-${deltaType}">${delta}</div>` : ''}
      </div>`;
  },

  /* 3D tilt effect on stat cards */
  attachTilt() {
    document.querySelectorAll('.stat-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r    = card.getBoundingClientRect();
        const x    = (e.clientX - r.left) / r.width  - 0.5;
        const y    = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${x*12}deg) rotateX(${-y*12}deg) translateY(-4px) scale(1.02)`;
        card.querySelector('.top-shine').style.opacity = '1';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.querySelector('.top-shine').style.opacity = '0';
      });
    });
  },

  populateStats() {
    const todayStr    = new Date().toDateString();
    const todaySess   = (APP.data.sessions||[]).filter(s => new Date(s.date).toDateString() === todayStr);
    const doneTasks   = (APP.data.tasks||[]).filter(t => t.status === 'done' && new Date(t.createdAt||0).toDateString() === todayStr);
    const totalMins   = todaySess.reduce((a,s) => a+(s.duration||0), 0);
    const totalQs     = todaySess.reduce((a,s) => a+(s.questions||0), 0);
    const streak      = updateStreak();

    setTimeout(() => {
      animateCount(document.getElementById('stat-tasks'), 0, doneTasks.length);
      document.getElementById('stat-time').textContent = (totalMins/60).toFixed(1)+'h';
      animateCount(document.getElementById('stat-qs'),  0, totalQs);
      animateCount(document.getElementById('stat-streak'), 0, streak);
    }, 120);

    const mocks = APP.data.mocks || [];
    if (mocks.length >= 1) {
      const last3  = mocks.slice(-3);
      const avgPct = last3.reduce((a,m) => a+(parseFloat(m.percentile)||0), 0) / last3.length;
      const estRank = Math.round(1200000 * (1 - avgPct/100));
      document.getElementById('rank-banner').style.display = 'block';
      document.getElementById('rank-pred-val').textContent = '#' + estRank.toLocaleString();
      document.getElementById('rank-pred-sub').textContent = `Based on last ${last3.length} mock${last3.length>1?'s':''} · avg ${avgPct.toFixed(1)}%ile`;
    }
  },

  renderCharts() {
    const sessions = APP.data.sessions || [];
    const days=[],hrs=[],qs=[];
    for (let i=6;i>=0;i--) {
      const d = new Date(); d.setDate(d.getDate()-i);
      days.push(d.toLocaleDateString('en-IN',{weekday:'short'}));
      const s = sessions.filter(x => new Date(x.date).toDateString()===d.toDateString());
      hrs.push(+(s.reduce((a,x)=>a+(x.duration||0),0)/60).toFixed(1));
      qs.push(s.reduce((a,x)=>a+(x.questions||0),0));
    }

    const chartBase = {
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{
        backgroundColor:'rgba(15,15,30,0.95)',
        borderColor:'rgba(108,99,255,0.3)',borderWidth:1,
        titleFont:{family:'JetBrains Mono',size:11},
        bodyFont:{family:'JetBrains Mono',size:11},
        padding:10,cornerRadius:8,
      }},
      scales:{
        x:{grid:{color:'rgba(255,255,255,0.035)'},ticks:{color:'#44445a',font:{family:'JetBrains Mono',size:10}}},
        y:{grid:{color:'rgba(255,255,255,0.035)'},ticks:{color:'#44445a',font:{family:'JetBrains Mono',size:10}},beginAtZero:true}
      },
      animation:{duration:1400,easing:'easeOutQuart'}
    };

    const wCtx = document.getElementById('chart-weekly')?.getContext('2d');
    if (wCtx) {
      const g = wCtx.createLinearGradient(0,0,0,185);
      g.addColorStop(0,'rgba(108,99,255,0.45)'); g.addColorStop(1,'rgba(108,99,255,0.0)');
      new Chart(wCtx, { type:'line', data:{
        labels:days,
        datasets:[{data:hrs,borderColor:'#6c63ff',backgroundColor:g,borderWidth:2.5,fill:true,tension:0.42,
          pointBackgroundColor:'#6c63ff',pointRadius:4,pointHoverRadius:7,pointBorderColor:'#0f0f1e',pointBorderWidth:2}]
      }, options:chartBase });
    }

    const qCtx = document.getElementById('chart-questions')?.getContext('2d');
    if (qCtx) {
      const g2 = qCtx.createLinearGradient(0,0,0,185);
      g2.addColorStop(0,'rgba(56,232,245,0.55)'); g2.addColorStop(1,'rgba(56,232,245,0.05)');
      new Chart(qCtx, { type:'bar', data:{
        labels:days,
        datasets:[{data:qs,backgroundColor:g2,borderColor:'#38e8f5',borderWidth:1.5,borderRadius:7,borderSkipped:false}]
      }, options:chartBase });
    }

    const subs = {Physics:0,Chemistry:0,Mathematics:0};
    (APP.data.tasks||[]).filter(t=>t.status==='done').forEach(t=>{if(subs[t.subject]!==undefined)subs[t.subject]++;});
    const total = Object.values(subs).reduce((a,b)=>a+b,0);
    document.getElementById('doughnut-num').textContent = total;

    const colors=['#6c63ff','#38e8f5','#ff5db3'];
    const sCtx = document.getElementById('chart-subjects')?.getContext('2d');
    if (sCtx) {
      new Chart(sCtx,{type:'doughnut',data:{
        labels:Object.keys(subs),
        datasets:[{data:Object.values(subs),backgroundColor:colors,borderColor:'#0f0f1e',borderWidth:4,hoverOffset:10,hoverBorderColor:colors}]
      },options:{responsive:false,maintainAspectRatio:false,cutout:'72%',
        plugins:{legend:{display:false},tooltip:{...chartBase.plugins.tooltip}},
        animation:{duration:1600,easing:'easeOutBounce'}}
      });
    }

    const leg = document.getElementById('subject-legend');
    if (leg) Object.keys(subs).forEach((s,i) => {
      leg.innerHTML += `<div style="display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:7px">
          <div style="width:8px;height:8px;border-radius:50%;background:${colors[i]}"></div>
          <span style="font-size:11px;color:var(--text2)">${s}</span>
        </div>
        <span style="font-family:var(--font-mono);font-size:11px;color:var(--text3)">${subs[s]}</span>
      </div>`;
    });
  },

  renderRecentMocks() {
    const el = document.getElementById('recent-mocks-list');
    if (!el) return;
    const mocks = (APP.data.mocks||[]).slice(-5).reverse();
    if (!mocks.length) { el.innerHTML = '<div class="empty-state" style="padding:24px 0"><p>No mocks yet</p></div>'; return; }
    mocks.forEach((m,i) => {
      const pct = parseFloat(m.percentile||0);
      const c = pct>=99?'var(--green)':pct>=95?'var(--cyan)':pct>=90?'var(--amber)':'var(--text2)';
      el.innerHTML += `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--bg3);border-radius:8px;border:1px solid var(--border);animation:fadeSlideUp 0.3s var(--expo) ${0.05*i}s both">
        <div>
          <div style="font-size:12px;font-weight:600">${m.name||'Mock'}</div>
          <div style="font-size:10px;color:var(--text3)">${new Date(m.date).toLocaleDateString('en-IN')}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:var(--font-mono);font-size:13px;font-weight:700;color:${c}">${m.percentile||'—'}%</div>
          <div style="font-size:10px;color:var(--text3)">${m.score||'—'} marks</div>
        </div>
      </div>`;
    });
  },

  renderTodayTasks() {
    const el = document.getElementById('today-tasks-list');
    if (!el) return;
    const today = new Date().toDateString();
    const tasks = (APP.data.tasks||[]).filter(t => new Date(t.createdAt||t.date||0).toDateString()===today).slice(0,8);
    if (!tasks.length) { el.innerHTML = '<div class="empty-state" style="padding:24px 0"><p>No tasks today</p></div>'; return; }
    tasks.forEach((t,i) => {
      const sc = {todo:'var(--text3)',inprogress:'var(--amber)',done:'var(--green)'}[t.status]||'var(--text3)';
      const sl = {todo:'Pending',inprogress:'In Progress',done:'Done'}[t.status]||t.status;
      el.innerHTML += `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--bg3);border-radius:8px;border:1px solid var(--border);animation:fadeSlideUp 0.3s var(--expo) ${0.05*i}s both">
        <div style="min-width:0;flex:1">
          <div style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.title}</div>
          <div style="font-size:10px;color:var(--text3)">${t.subject||''} · ${t.questions||0} Qs</div>
        </div>
        <span style="font-size:10px;font-weight:700;color:${sc};white-space:nowrap;margin-left:8px">${sl}</span>
      </div>`;
    });
  },

  quickLog() {
    openModal(`
      <div class="modal-header">
        <div class="modal-title">Log Study Session</div>
        <div class="modal-close" onclick="closeModal()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="input-group"><label class="input-label">Subject</label>
          <select class="select" id="ql-sub"><option>Physics</option><option>Chemistry</option><option>Mathematics</option></select></div>
        <div class="grid-2" style="gap:12px">
          <div class="input-group"><label class="input-label">Duration (min)</label>
            <input type="number" class="input" id="ql-dur" placeholder="60" min="1"></div>
          <div class="input-group"><label class="input-label">Questions Done</label>
            <input type="number" class="input" id="ql-qs" placeholder="30" min="0"></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="APP.pageInits.dashboard.saveQuickLog()">Log Session</button>
      </div>`);
  },

  saveQuickLog() {
    APP.data.sessions.push({
      subject:   document.getElementById('ql-sub').value,
      duration:  parseInt(document.getElementById('ql-dur').value)||0,
      questions: parseInt(document.getElementById('ql-qs').value)||0,
      date:      new Date().toISOString()
    });
    saveData(); closeModal(); toast('Session logged!','success'); this.render();
  }
};
