APP.pageInits['mocks'] = {
  initialized: false,

  init() { this.render(); },
  refresh() { this.render(); },

  render() {
    const pg = document.getElementById('page-mocks');
    pg.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">Mock Logger</div>
          <div class="page-subtitle">Track your mock tests, analyze trends, and identify weak areas</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="APP.pageInits.mocks.addModal()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Log Mock
        </button>
      </div>

      <!-- Stats Row -->
      <div class="stat-grid" style="margin-bottom:20px;grid-template-columns:repeat(5,1fr)">
        <div class="stat-card"><div class="stat-val" id="ms-total">0</div><div class="stat-label">Total Mocks</div></div>
        <div class="stat-card"><div class="stat-val" id="ms-best">—</div><div class="stat-label">Best %ile</div></div>
        <div class="stat-card"><div class="stat-val" id="ms-avg">—</div><div class="stat-label">Avg %ile</div></div>
        <div class="stat-card"><div class="stat-val" id="ms-best-score">—</div><div class="stat-label">Best Score</div></div>
        <div class="stat-card"><div class="stat-val" id="ms-trend" style="font-size:20px">—</div><div class="stat-label">Trend</div></div>
      </div>

      <!-- Charts -->
      <div class="grid-2" style="margin-bottom:20px;animation:fadeSlideUp 0.4s ease 0.1s both">
        <div class="card" style="height:260px">
          <div class="card-title">Percentile Trend</div>
          <canvas id="chart-pct-trend" height="200"></canvas>
        </div>
        <div class="card" style="height:260px">
          <div class="card-title">Score Distribution</div>
          <canvas id="chart-score-dist" height="200"></canvas>
        </div>
      </div>

      <!-- Subject-wise Breakdown -->
      <div class="card" style="margin-bottom:20px;animation:fadeSlideUp 0.4s ease 0.15s both">
        <div class="card-title" style="margin-bottom:16px">Subject-wise Average Score</div>
        <div id="subject-bars" style="display:flex;flex-direction:column;gap:14px"></div>
      </div>

      <!-- Mock List -->
      <div class="card" style="animation:fadeSlideUp 0.4s ease 0.2s both">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div class="card-title" style="margin:0">All Mocks</div>
          <span style="font-size:12px;color:var(--text3)" id="mock-count-label"></span>
        </div>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse" id="mocks-table">
            <thead>
              <tr style="border-bottom:1px solid var(--border)">
                ${['#','Name','Date','Score','Percentile','Phy','Chem','Math','Time','Mistakes',''].map(h=>
                  `<th style="text-align:left;padding:8px 10px;font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:0.06em;white-space:nowrap">${h}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody id="mocks-tbody"></tbody>
          </table>
        </div>
      </div>
    `;
    this.populateStats();
    this.renderCharts();
    this.renderTable();
  },

  populateStats() {
    const mocks = APP.data.mocks || [];
    if (!mocks.length) return;
    const pcts = mocks.map(m => parseFloat(m.percentile)||0).filter(p => p>0);
    const scores = mocks.map(m => parseFloat(m.score)||0).filter(s => s>0);
    const avg = pcts.length ? (pcts.reduce((a,b)=>a+b,0)/pcts.length).toFixed(1) : '—';
    const best = pcts.length ? Math.max(...pcts).toFixed(1) : '—';
    const bestScore = scores.length ? Math.max(...scores) : '—';

    // Trend (last 3 vs previous 3)
    let trend = '—';
    if (pcts.length >= 2) {
      const last = pcts.slice(-3);
      const prev = pcts.slice(-6,-3);
      if (prev.length) {
        const avgLast = last.reduce((a,b)=>a+b,0)/last.length;
        const avgPrev = prev.reduce((a,b)=>a+b,0)/prev.length;
        trend = avgLast > avgPrev ? '↑ Up' : avgLast < avgPrev ? '↓ Down' : '→ Flat';
      }
    }

    animateCount(document.getElementById('ms-total'), 0, mocks.length);
    document.getElementById('ms-best').textContent = best !== '—' ? best + '%' : '—';
    document.getElementById('ms-avg').textContent = avg !== '—' ? avg + '%' : '—';
    document.getElementById('ms-best-score').textContent = bestScore;
    const trendEl = document.getElementById('ms-trend');
    trendEl.textContent = trend;
    trendEl.style.color = trend.includes('Up') ? 'var(--green)' : trend.includes('Down') ? 'var(--red)' : 'var(--amber)';
  },

  renderCharts() {
    const mocks = APP.data.mocks || [];
    const labels = mocks.map((m,i) => m.name ? m.name.slice(0,10) : `Mock ${i+1}`);
    const pcts = mocks.map(m => parseFloat(m.percentile)||0);
    const scores = mocks.map(m => parseFloat(m.score)||0);

    const opts = {
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{
        x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#55557a',font:{family:'JetBrains Mono',size:9}}},
        y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#55557a',font:{family:'JetBrains Mono',size:9}}}
      },
      animation:{duration:1200,easing:'easeOutQuart'}
    };

    if (document.getElementById('chart-pct-trend')) {
      const ctx = document.getElementById('chart-pct-trend').getContext('2d');
      const g = ctx.createLinearGradient(0,0,0,200);
      g.addColorStop(0,'rgba(108,99,255,0.4)'); g.addColorStop(1,'rgba(108,99,255,0)');
      new Chart(ctx, {
        type:'line', data:{
          labels, datasets:[{data:pcts,borderColor:'var(--indigo)',backgroundColor:g,borderWidth:2,fill:true,tension:0.4,pointBackgroundColor:'var(--indigo)',pointRadius:4}]
        }, options:{...opts, scales:{...opts.scales, y:{...opts.scales.y, min:0, max:100}}}
      });
    }

    if (document.getElementById('chart-score-dist')) {
      const ctx = document.getElementById('chart-score-dist').getContext('2d');
      new Chart(ctx, {
        type:'bar', data:{
          labels, datasets:[{data:scores,backgroundColor:'rgba(255,107,107,0.5)',borderColor:'var(--red)',borderWidth:1,borderRadius:5}]
        }, options:opts
      });
    }

    // Subject bars
    const sbEl = document.getElementById('subject-bars');
    if (!sbEl) return;
    const subjects = [
      { key:'phy', label:'Physics', color:'var(--indigo)' },
      { key:'chem', label:'Chemistry', color:'var(--cyan)' },
      { key:'math', label:'Mathematics', color:'var(--pink)' }
    ];
    subjects.forEach(sub => {
      const vals = mocks.map(m => parseFloat(m[sub.key])||0).filter(v=>v>0);
      const avg = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
      const max = 100; const pct = Math.round(avg/max*100);
      sbEl.innerHTML += `
        <div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:12px;color:${sub.color};font-weight:500">${sub.label}</span>
            <span style="font-family:var(--font-mono);font-size:12px;color:var(--text2)">${avg.toFixed(1)}/100 avg</span>
          </div>
          <div class="progress-wrap" style="height:7px">
            <div class="progress-bar" style="background:${sub.color};width:${pct}%"></div>
          </div>
        </div>`;
    });
  },

  renderTable() {
    const tbody = document.getElementById('mocks-tbody');
    if (!tbody) return;
    const mocks = (APP.data.mocks||[]).slice().reverse();
    document.getElementById('mock-count-label').textContent = `${mocks.length} test${mocks.length!==1?'s':''}`;
    if (!mocks.length) {
      tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:32px;color:var(--text3);font-size:13px">No mocks logged yet. Click "Log Mock" to add your first test.</td></tr>`;
      return;
    }
    tbody.innerHTML = mocks.map((m,i) => {
      const pct = parseFloat(m.percentile)||0;
      const pctColor = pct>=99?'var(--green)':pct>=95?'var(--cyan)':pct>=90?'var(--amber)':'var(--text2)';
      return `<tr style="border-bottom:1px solid var(--border);transition:background 0.2s" onmouseenter="this.style.background='var(--bg3)'" onmouseleave="this.style.background='transparent'">
        <td style="padding:10px;font-family:var(--font-mono);font-size:11px;color:var(--text3)">${mocks.length-i}</td>
        <td style="padding:10px;font-size:13px;font-weight:500">${m.name||'Mock Test'}</td>
        <td style="padding:10px;font-size:12px;color:var(--text2)">${new Date(m.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'})}</td>
        <td style="padding:10px;font-family:var(--font-mono);font-size:13px;font-weight:600">${m.score||'—'}</td>
        <td style="padding:10px"><span style="font-family:var(--font-mono);font-size:13px;font-weight:700;color:${pctColor}">${m.percentile||'—'}%</span></td>
        <td style="padding:10px;font-family:var(--font-mono);font-size:12px;color:var(--indigo2)">${m.phy||'—'}</td>
        <td style="padding:10px;font-family:var(--font-mono);font-size:12px;color:var(--cyan)">${m.chem||'—'}</td>
        <td style="padding:10px;font-family:var(--font-mono);font-size:12px;color:var(--pink)">${m.math||'—'}</td>
        <td style="padding:10px;font-size:12px;color:var(--text3)">${m.timeSpent||'—'}</td>
        <td style="padding:10px"><span class="badge ${parseInt(m.mistakes||0)>30?'badge-red':parseInt(m.mistakes||0)>15?'badge-amber':'badge-green'}">${m.mistakes||0}</span></td>
        <td style="padding:10px"><button class="btn btn-danger btn-sm" style="padding:4px 8px" onclick="APP.pageInits.mocks.delete(${i})">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
        </button></td>
      </tr>`;
    }).join('');
  },

  delete(idx) {
    const realIdx = APP.data.mocks.length - 1 - idx;
    APP.data.mocks.splice(realIdx, 1);
    saveData(); this.render(); toast('Mock deleted');
  },

  addModal() {
    openModal(`
      <div class="modal-header">
        <div class="modal-title">Log Mock Test</div>
        <div class="modal-close" onclick="closeModal()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="input-group">
          <label class="input-label">Mock Name</label>
          <input class="input" id="mm-name" placeholder="e.g. JEE Main Attempt 3 / Allen Test 12">
        </div>
        <div class="grid-2" style="gap:12px">
          <div class="input-group">
            <label class="input-label">Total Score (out of 300)</label>
            <input type="number" class="input" id="mm-score" placeholder="245" min="0" max="300">
          </div>
          <div class="input-group">
            <label class="input-label">Percentile</label>
            <input type="number" class="input" id="mm-pct" placeholder="98.5" min="0" max="100" step="0.01">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
          <div class="input-group">
            <label class="input-label">Physics (/100)</label>
            <input type="number" class="input" id="mm-phy" placeholder="82" min="0" max="100">
          </div>
          <div class="input-group">
            <label class="input-label">Chemistry (/100)</label>
            <input type="number" class="input" id="mm-chem" placeholder="76" min="0" max="100">
          </div>
          <div class="input-group">
            <label class="input-label">Mathematics (/100)</label>
            <input type="number" class="input" id="mm-math" placeholder="87" min="0" max="100">
          </div>
        </div>
        <div class="grid-2" style="gap:12px">
          <div class="input-group">
            <label class="input-label">Time Spent (e.g. 2h 45m)</label>
            <input class="input" id="mm-time" placeholder="3h 0m">
          </div>
          <div class="input-group">
            <label class="input-label">Mistakes / Wrong Answers</label>
            <input type="number" class="input" id="mm-mistakes" placeholder="12" min="0">
          </div>
        </div>
        <div class="input-group">
          <label class="input-label">Notes / Weak Areas</label>
          <textarea class="textarea" id="mm-notes" placeholder="e.g. Weak in Organic Chemistry, rushed Calculus..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="APP.pageInits.mocks.saveMock()">Log Mock</button>
      </div>
    `);
  },

  saveMock() {
    const score = document.getElementById('mm-score').value;
    const pct   = document.getElementById('mm-pct').value;
    if (!score && !pct) { toast('Enter score or percentile', 'error'); return; }
    APP.data.mocks.push({
      name:      document.getElementById('mm-name').value || 'Mock Test',
      score:     score,
      percentile: pct,
      phy:       document.getElementById('mm-phy').value,
      chem:      document.getElementById('mm-chem').value,
      math:      document.getElementById('mm-math').value,
      timeSpent: document.getElementById('mm-time').value,
      mistakes:  document.getElementById('mm-mistakes').value || 0,
      notes:     document.getElementById('mm-notes').value,
      date:      new Date().toISOString()
    });
    saveData(); closeModal(); this.render();
    toast('Mock logged!', 'success');
  }
};
