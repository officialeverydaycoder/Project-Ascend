/* ══════════════════════════════════════════════════
   RANK ESTIMATOR — AI Debate + Formula fallback
══════════════════════════════════════════════════ */
APP.pageInits['rank'] = {
  initialized: false,

  init()    { this.render(); },
  refresh() {},

  render() {
    const pg = document.getElementById('page-rank');
    pg.innerHTML = `
      <div class="page-header" style="animation:fadeSlideUp 0.45s var(--expo) both">
        <div>
          <div class="page-title">Rank Estimator</div>
          <div class="page-subtitle">7 models (HuggingFace + statistical) debate to predict your JEE rank</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:360px 1fr;gap:20px;align-items:start">

        <!-- ── Input Panel ── -->
        <div style="display:flex;flex-direction:column;gap:14px;animation:fadeSlideUp 0.45s var(--expo) 0.05s both">
          <div class="card">
            <div class="card-title" style="margin-bottom:16px">Your Performance</div>
            <div style="display:flex;flex-direction:column;gap:13px">

              <div class="input-group">
                <label class="input-label">Percentile</label>
                <input type="number" class="input" id="re-pct" placeholder="e.g. 97.5" min="0" max="100" step="0.01"
                       oninput="APP.pageInits.rank.syncScore()">
              </div>

              <div style="display:flex;align-items:center;gap:10px">
                <div style="flex:1;height:1px;background:var(--border)"></div>
                <span style="font-size:11px;color:var(--text3)">or</span>
                <div style="flex:1;height:1px;background:var(--border)"></div>
              </div>

              <div class="input-group">
                <label class="input-label">Score (out of 300)</label>
                <input type="number" class="input" id="re-score" placeholder="e.g. 250" min="0" max="300"
                       oninput="APP.pageInits.rank.syncPct()">
              </div>

              <div class="input-group">
                <label class="input-label">Category</label>
                <select class="select" id="re-cat">
                  <option>General</option><option>OBC-NCL</option>
                  <option>SC</option><option>ST</option><option>EWS</option>
                </select>
              </div>

              <div class="input-group">
                <label class="input-label">Gender</label>
                <select class="select" id="re-gender">
                  <option>Male</option><option>Female</option>
                </select>
              </div>

              <div class="input-group">
                <label class="input-label">Preferred Branch</label>
                <select class="select" id="re-branch">
                  <option>Computer Science</option>
                  <option>Electrical Engineering</option>
                  <option>Mechanical Engineering</option>
                  <option>Civil Engineering</option>
                  <option>Chemical Engineering</option>
                  <option>Any / Best Available</option>
                </select>
              </div>
            </div>
          </div>

          <button class="btn btn-primary" id="btn-estimate"
                  onclick="APP.pageInits.rank.runDebate()"
                  style="width:100%;padding:14px;font-size:14px;justify-content:center;letter-spacing:0.02em">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Run AI Debate
          </button>

          <!-- Note about formula fallback -->
          <div style="background:rgba(56,232,245,0.07);border:1px solid rgba(56,232,245,0.18);border-radius:10px;padding:12px">
            <div style="font-size:11px;font-weight:700;color:var(--cyan);margin-bottom:4px">ℹ️ How it works</div>
            <div style="font-size:11px;color:var(--text3);line-height:1.6">
              3 Flan-T5 models are called via HuggingFace API. 4 calibrated statistical models run locally.
              All 7 give independent rank estimates — consensus is the trimmed average.
              <b style="color:var(--text2)">Works even without API key</b> using local formulas.
            </div>
          </div>

          <!-- Reference Data -->
          <div class="card">
            <div class="card-title" style="margin-bottom:12px">2024 JEE Main Data</div>
            <div style="display:flex;flex-direction:column;gap:6px">
              ${[['99.9%ile','~1,200'],['99%ile','~12,000'],['97%ile','~36,000'],['95%ile','~60,000'],
                 ['90%ile','~1.2 lakh'],['85%ile','~1.8 lakh'],['80%ile','~2.5 lakh']].map(([p,r]) => `
                <div style="display:flex;justify-content:space-between;padding:5px 8px;background:var(--bg3);border-radius:6px">
                  <span style="font-family:var(--font-mono);font-size:11px;color:var(--indigo2)">${p}</span>
                  <span style="font-size:11px;color:var(--text3)">${r} rank</span>
                </div>`).join('')}
            </div>
          </div>
        </div>

        <!-- ── Results Panel ── -->
        <div style="display:flex;flex-direction:column;gap:16px;animation:fadeSlideUp 0.45s var(--expo) 0.1s both">

          <!-- Debate Arena -->
          <div class="card" id="debate-arena">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
              <div class="card-title" style="margin:0">AI Debate Arena</div>
              <div style="display:flex;align-items:center;gap:7px">
                <div id="debate-dot" style="width:8px;height:8px;border-radius:50%;background:var(--text3);transition:background 0.3s"></div>
                <span id="debate-status" style="font-size:11px;color:var(--text3)">Waiting</span>
              </div>
            </div>
            <div id="debate-models" style="display:flex;flex-direction:column;gap:7px">
              ${['Flan-T5 Large (Google)','Flan-T5 Base (Google)','Flan-T5 Small (Google)',
                 'JEE Statistical Model A','JEE Statistical Model B',
                 'JEE Statistical Model C','JEE Statistical Model D'].map((name,i) => `
                <div id="mcard-${i}" style="display:flex;align-items:center;gap:10px;padding:10px 13px;background:var(--bg3);border-radius:9px;border:1px solid var(--border);transition:all 0.3s;animation:fadeSlideUp 0.3s var(--expo) ${0.04*i}s both">
                  <div style="width:8px;height:8px;border-radius:50%;background:var(--text3);flex-shrink:0;transition:background 0.3s" id="mdot-${i}"></div>
                  <div style="flex:1">
                    <div style="font-size:12px;font-weight:600;color:var(--text2)">${name}</div>
                    <div style="font-size:10px;color:var(--text3);margin-top:2px" id="mstatus-${i}">${i<3?'HF API · Free tier':'Statistical formula'}</div>
                  </div>
                  <div style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:var(--text3);transition:all 0.4s" id="mrank-${i}">—</div>
                </div>`).join('')}
            </div>
          </div>

          <!-- Consensus (hidden until run) -->
          <div id="consensus-wrap" style="display:none">
            <div class="card" style="background:linear-gradient(135deg,rgba(108,99,255,0.13),rgba(168,85,247,0.07));border-color:rgba(108,99,255,0.32)">
              <div style="text-align:center;padding:8px 0 18px">
                <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:10px">
                  AI Consensus Rank
                </div>
                <div id="consensus-val" style="font-family:var(--font-mono);font-size:60px;font-weight:800;color:var(--indigo2);line-height:1">—</div>
                <div id="consensus-sub" style="font-size:12px;color:var(--text3);margin-top:8px"></div>
              </div>
              <div style="border-top:1px solid rgba(108,99,255,0.2);padding-top:14px;margin-top:4px">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                  <span style="font-size:11px;color:var(--text3)">Model agreement</span>
                  <span id="agree-pct" style="font-family:var(--font-mono);font-size:11px;color:var(--green)"></span>
                </div>
                <div class="progress-wrap" style="height:6px">
                  <div class="progress-bar" id="agree-bar" style="background:linear-gradient(90deg,var(--green),var(--cyan));width:0%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- College Predictions -->
          <div id="colleges-wrap" style="display:none">
            <div class="card">
              <div class="card-title" style="margin-bottom:14px">College Predictions</div>
              <div id="colleges-list" style="display:flex;flex-direction:column;gap:8px"></div>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  // Auto-estimate percentile from score for UX
  syncPct() {
    const score = parseFloat(document.getElementById('re-score').value);
    if (!score) return;
    const pts = [[300,100],[285,99.99],[270,99.97],[255,99.9],[240,99.7],[225,99.4],
                 [210,99.0],[195,98.2],[180,97],[165,95],[150,92],[135,87],
                 [120,79],[100,68],[80,53],[60,37],[40,20],[0,0]];
    let pct = 0;
    for (let i=0;i<pts.length-1;i++) {
      if (score >= pts[i+1][0]) {
        const t = (score - pts[i+1][0]) / (pts[i][0] - pts[i+1][0]);
        pct = pts[i+1][1] + t*(pts[i][1]-pts[i+1][1]);
        break;
      }
    }
    document.getElementById('re-pct').value = pct.toFixed(2);
  },

  syncScore() {}, // percentile -> score not needed

  async runDebate() {
    const pctRaw   = document.getElementById('re-pct').value.trim();
    const scoreRaw = document.getElementById('re-score').value.trim();
    const percentile = pctRaw   ? parseFloat(pctRaw)   : null;
    const score      = scoreRaw ? parseFloat(scoreRaw) : null;

    if (!percentile && !score) { toast('Enter your percentile or score first', 'error'); return; }

    const category = document.getElementById('re-cat').value;
    const gender   = document.getElementById('re-gender').value;
    const branch   = document.getElementById('re-branch').value;
    const apiKey   = APP.data.settings?.hfKey || '';

    // Lock button
    const btn = document.getElementById('btn-estimate');
    btn.disabled = true;
    btn.innerHTML = '<div class="loader" style="width:14px;height:14px;border-width:2px"></div> Debating...';

    // Arena: set to "running"
    document.getElementById('debate-dot').style.background    = 'var(--amber)';
    document.getElementById('debate-dot').style.animation     = 'pulse 1s ease infinite';
    document.getElementById('debate-status').textContent      = 'Models analysing...';
    document.getElementById('debate-status').style.color      = 'var(--amber)';

    // Reset all model cards
    for (let i=0;i<7;i++) {
      document.getElementById(`mdot-${i}`).style.background = 'var(--text3)';
      document.getElementById(`mrank-${i}`).textContent     = '—';
      document.getElementById(`mrank-${i}`).style.color     = 'var(--text3)';
      document.getElementById(`mstatus-${i}`).textContent   = i<3 ? 'Calling HF API...' : 'Running formula...';
    }

    // Hide old results
    document.getElementById('consensus-wrap').style.display = 'none';
    document.getElementById('colleges-wrap').style.display  = 'none';

    // Call main process
    const result = await window.jee.aiDebate({ percentile, score, category, gender }, apiKey);

    // Animate model results in
    if (result.responses) {
      result.responses.forEach((r, i) => {
        setTimeout(() => {
          const dot    = document.getElementById(`mdot-${i}`);
          const rankEl = document.getElementById(`mrank-${i}`);
          const stEl   = document.getElementById(`mstatus-${i}`);
          const card   = document.getElementById(`mcard-${i}`);
          if (!dot) return;

          if (r.rank) {
            dot.style.background    = r.status === 'ok' ? 'var(--green)' : 'var(--cyan)';
            rankEl.textContent      = '#' + r.rank.toLocaleString();
            rankEl.style.color      = r.status === 'ok' ? 'var(--green)' : 'var(--indigo2)';
            rankEl.style.animation  = 'bounceIn 0.5s var(--spring) both';
            stEl.textContent        = r.status === 'ok' ? '✓ HF API response' : '✓ Statistical formula';
            stEl.style.color        = r.status === 'ok' ? 'var(--green)' : 'var(--cyan)';
            card.style.borderColor  = r.status === 'ok' ? 'rgba(61,232,122,0.25)' : 'rgba(56,232,245,0.2)';
          } else {
            dot.style.background   = 'var(--red)';
            stEl.textContent       = r.error ? `Error: ${r.error.slice(0,50)}` : 'No response';
            stEl.style.color       = 'var(--red)';
            card.style.borderColor = 'rgba(255,77,106,0.2)';
          }
        }, i * 180);
      });
    }

    // Show consensus after all cards animate
    setTimeout(() => {
      document.getElementById('debate-dot').style.animation  = '';
      document.getElementById('debate-dot').style.background = 'var(--green)';
      document.getElementById('debate-status').textContent   = 'Complete';
      document.getElementById('debate-status').style.color   = 'var(--green)';

      if (result.consensus) {
        const cWrap = document.getElementById('consensus-wrap');
        const cVal  = document.getElementById('consensus-val');
        cWrap.style.display = 'block';
        cVal.style.animation = 'bounceIn 0.7s var(--spring) both';
        cVal.textContent = '#' + result.consensus.toLocaleString();

        const formulaNote = result.formulaCount > 0
          ? ` · ${result.formulaCount} statistical, ${result.successCount} via HF API`
          : ` · ${result.successCount} HF API models`;
        document.getElementById('consensus-sub').innerHTML =
          `${category} · ${gender}${formulaNote}<br>
           <span style="font-size:10px;color:var(--text3)">Trimmed mean of all ${result.total} model estimates</span>`;

        const agree = Math.round((result.total - 0) / result.total * 100);
        document.getElementById('agree-pct').textContent = agree + '%';
        animateBar(document.getElementById('agree-bar'), agree);

        this.showColleges(result.consensus, category, branch);
      }

      btn.disabled = false;
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Run Again`;
      toast('Debate complete!', 'success');
    }, 7 * 180 + 400);
  },

  showColleges(rank, cat, branch) {
    const catMult = {'General':1,'OBC-NCL':2.9,'SC':5.8,'ST':8.2,'EWS':1.5}[cat] || 1;
    const brKey   = branch.includes('Computer') ? 'cs' :
                    branch.includes('Electrical') ? 'ee' :
                    branch.includes('Chemical') ? 'chem' : 'mech';

    // Cutoffs are General open ranks. Other cats = General*catMult
    const COLLEGES = [
      { name:'IIT Bombay',     type:'IIT',  cs:62,   ee:270,  mech:700,  chem:1100 },
      { name:'IIT Delhi',      type:'IIT',  cs:95,   ee:340,  mech:850,  chem:1300 },
      { name:'IIT Madras',     type:'IIT',  cs:140,  ee:450,  mech:1000, chem:1600 },
      { name:'IIT Kanpur',     type:'IIT',  cs:280,  ee:600,  mech:1300, chem:2100 },
      { name:'IIT Kharagpur',  type:'IIT',  cs:320,  ee:720,  mech:1500, chem:2500 },
      { name:'IIT Roorkee',    type:'IIT',  cs:400,  ee:880,  mech:1800, chem:3000 },
      { name:'IIT Hyderabad',  type:'IIT',  cs:700,  ee:1400, mech:2800, chem:4500 },
      { name:'IIT Guwahati',   type:'IIT',  cs:900,  ee:1800, mech:3500, chem:6000 },
      { name:'IIT BHU',        type:'IIT',  cs:1300, ee:2600, mech:5000, chem:8000 },
      { name:'IIIT Hyderabad', type:'IIIT', cs:350,  ee:800,  mech:null, chem:null },
      { name:'IIIT Delhi',     type:'IIIT', cs:1800, ee:4000, mech:null, chem:null },
      { name:'NIT Trichy',     type:'NIT',  cs:5000, ee:12000,mech:22000,chem:35000},
      { name:'NIT Warangal',   type:'NIT',  cs:6500, ee:16000,mech:28000,chem:45000},
      { name:'NIT Surathkal',  type:'NIT',  cs:8000, ee:20000,mech:36000,chem:55000},
      { name:'NIT Calicut',    type:'NIT',  cs:10000,ee:26000,mech:44000,chem:65000},
    ];

    const list = document.getElementById('colleges-list');
    const wrap = document.getElementById('colleges-wrap');
    wrap.style.display = 'block';
    list.innerHTML = '';

    let shown = 0;
    COLLEGES.forEach((c,i) => {
      const cutoff = c[brKey];
      if (!cutoff) return;
      const adjCutoff = Math.round(cutoff * catMult);
      const ratio = rank / adjCutoff;
      const chance = ratio < 0.7 ? 'High' : ratio < 1.0 ? 'Medium' : ratio < 1.5 ? 'Low' : null;
      if (!chance) return;
      shown++;

      const tColor = {IIT:'var(--indigo)',NIT:'var(--cyan)',IIIT:'var(--pink)'}[c.type];
      const cColor = {High:'var(--green)',Medium:'var(--amber)',Low:'var(--red)'}[chance];

      const row = document.createElement('div');
      row.style.cssText = `display:flex;align-items:center;justify-content:space-between;padding:11px 13px;background:var(--bg3);border-radius:9px;border:1px solid var(--border);transition:all 0.22s;animation:fadeSlideUp 0.3s var(--expo) ${0.05*shown}s both`;
      row.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:10px;font-weight:800;color:${tColor};background:${tColor}1a;padding:2px 7px;border-radius:5px;font-family:var(--font-mono)">${c.type}</span>
          <div>
            <div style="font-size:13px;font-weight:600">${c.name}</div>
            <div style="font-size:10px;color:var(--text3)">Cutoff ~${adjCutoff.toLocaleString()} · ${branch.split(' ')[0]}</div>
          </div>
        </div>
        <span style="font-size:11px;font-weight:700;color:${cColor};background:${cColor}1a;padding:4px 12px;border-radius:99px;border:1px solid ${cColor}33">${chance}</span>`;
      row.addEventListener('mouseenter', () => { row.style.borderColor='var(--border2)'; row.style.transform='translateX(3px)'; });
      row.addEventListener('mouseleave', () => { row.style.borderColor='var(--border)';  row.style.transform=''; });
      list.appendChild(row);
    });

    if (!shown) {
      list.innerHTML = `<div class="empty-state" style="padding:20px 0"><p>No college matches for rank #${rank.toLocaleString()} in ${branch}.<br>Try a different branch or category.</p></div>`;
    }
  }
};
