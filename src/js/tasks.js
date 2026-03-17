APP.pageInits['tasks'] = {
  initialized: false,
  filterSubject: 'All',
  filterType: 'All',

  init() { this.render(); },
  refresh() { this.render(); },

  render() {
    const pg = document.getElementById('page-tasks');
    pg.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">Task Tracker</div>
          <div class="page-subtitle">Track your DPPs, modules and study sessions</div>
        </div>
        <div style="display:flex;gap:10px;align-items:center">
          <select class="select" style="width:130px;padding:8px 12px" id="filter-sub" onchange="APP.pageInits.tasks.setFilter()">
            <option>All</option><option>Physics</option><option>Chemistry</option><option>Mathematics</option>
          </select>
          <select class="select" style="width:130px;padding:8px 12px" id="filter-type" onchange="APP.pageInits.tasks.setFilter()">
            <option>All</option><option>DPP</option><option>Module</option><option>Self Study</option><option>Revision</option><option>Mock</option>
          </select>
          <button class="btn btn-primary btn-sm" onclick="APP.pageInits.tasks.addModal()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Task
          </button>
        </div>
      </div>

      <!-- Overall Progress -->
      <div class="card" style="margin-bottom:20px;animation:fadeSlideUp 0.4s ease both">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <div class="card-title" style="margin:0">Overall Progress</div>
          <div style="display:flex;gap:16px">
            <div style="text-align:center"><div style="font-family:var(--font-mono);font-size:18px;font-weight:600;color:var(--text)" id="ov-total">0</div><div style="font-size:10px;color:var(--text3)">Total</div></div>
            <div style="text-align:center"><div style="font-family:var(--font-mono);font-size:18px;font-weight:600;color:var(--amber)" id="ov-inprog">0</div><div style="font-size:10px;color:var(--text3)">In Progress</div></div>
            <div style="text-align:center"><div style="font-family:var(--font-mono);font-size:18px;font-weight:600;color:var(--green)" id="ov-done">0</div><div style="font-size:10px;color:var(--text3)">Done</div></div>
          </div>
        </div>
        <div class="progress-wrap" style="height:8px">
          <div class="progress-bar" id="ov-bar" style="background:linear-gradient(90deg,var(--indigo),var(--cyan));width:0%"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:6px">
          <span style="font-size:11px;color:var(--text3)" id="qs-progress-label">0 / 0 questions completed</span>
          <span style="font-family:var(--font-mono);font-size:11px;color:var(--indigo2)" id="ov-pct">0%</span>
        </div>
      </div>

      <!-- Kanban Columns -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;animation:fadeSlideUp 0.4s ease 0.1s both">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <div style="width:8px;height:8px;border-radius:50%;background:var(--text3)"></div>
            <span style="font-family:var(--font-display);font-size:12px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em">Pending</span>
            <span class="badge badge-indigo" id="cnt-todo">0</span>
          </div>
          <div id="col-todo" style="display:flex;flex-direction:column;gap:8px;min-height:200px"></div>
        </div>
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <div style="width:8px;height:8px;border-radius:50%;background:var(--amber)"></div>
            <span style="font-family:var(--font-display);font-size:12px;font-weight:700;color:var(--amber);text-transform:uppercase;letter-spacing:0.08em">In Progress</span>
            <span class="badge badge-amber" id="cnt-inprogress">0</span>
          </div>
          <div id="col-inprogress" style="display:flex;flex-direction:column;gap:8px;min-height:200px"></div>
        </div>
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <div style="width:8px;height:8px;border-radius:50%;background:var(--green)"></div>
            <span style="font-family:var(--font-display);font-size:12px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:0.08em">Completed</span>
            <span class="badge badge-green" id="cnt-done">0</span>
          </div>
          <div id="col-done" style="display:flex;flex-direction:column;gap:8px;min-height:200px"></div>
        </div>
      </div>
    `;

    document.getElementById('filter-sub').value = this.filterSubject;
    document.getElementById('filter-type').value = this.filterType;
    this.populateTasks();
  },

  setFilter() {
    this.filterSubject = document.getElementById('filter-sub').value;
    this.filterType = document.getElementById('filter-type').value;
    this.populateTasks();
  },

  populateTasks() {
    let tasks = APP.data.tasks || [];
    if (this.filterSubject !== 'All') tasks = tasks.filter(t => t.subject === this.filterSubject);
    if (this.filterType !== 'All') tasks = tasks.filter(t => t.type === this.filterType);

    const cols = { todo: [], inprogress: [], done: [] };
    tasks.forEach(t => { if (cols[t.status]) cols[t.status].push(t); });

    const totalQs = tasks.reduce((a,t) => a+(parseInt(t.questions)||0), 0);
    const doneQs  = tasks.filter(t => t.status==='done').reduce((a,t) => a+(parseInt(t.questions)||0), 0);
    const pct = totalQs ? Math.round(doneQs/totalQs*100) : 0;

    // Overall stats
    document.getElementById('ov-total').textContent   = tasks.length;
    document.getElementById('ov-inprog').textContent  = cols.inprogress.length;
    document.getElementById('ov-done').textContent    = cols.done.length;
    document.getElementById('qs-progress-label').textContent = `${doneQs.toLocaleString()} / ${totalQs.toLocaleString()} questions completed`;
    document.getElementById('ov-pct').textContent = `${pct}%`;
    animateBar(document.getElementById('ov-bar'), pct);

    // Counters
    document.getElementById('cnt-todo').textContent       = cols.todo.length;
    document.getElementById('cnt-inprogress').textContent = cols.inprogress.length;
    document.getElementById('cnt-done').textContent       = cols.done.length;

    // Render cards
    ['todo','inprogress','done'].forEach(status => {
      const el = document.getElementById(`col-${status}`);
      el.innerHTML = '';
      if (!cols[status].length) {
        el.innerHTML = `<div style="border:2px dashed var(--border);border-radius:var(--radius);padding:28px;text-align:center;color:var(--text3);font-size:12px">Drop tasks here</div>`;
        return;
      }
      cols[status].forEach((t, i) => el.appendChild(this.makeCard(t, i)));
    });
  },

  makeCard(t, idx) {
    const el = document.createElement('div');
    const subColor = { Physics:'var(--indigo)', Chemistry:'var(--cyan)', Mathematics:'var(--pink)' }[t.subject] || 'var(--text3)';
    const qPct = t.questions ? Math.round((t.questionsCompleted||0)/t.questions*100) : 0;

    el.style.cssText = `background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:14px;cursor:pointer;transition:all 0.2s;animation:fadeSlideUp 0.3s ease ${0.03*idx}s both`;
    el.innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px">
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px;line-height:1.3">${t.title}</div>
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span style="font-size:10px;font-weight:600;color:${subColor}">${t.subject||'General'}</span>
            ${t.type ? `<span class="chip">${t.type}</span>` : ''}
            ${t.date ? `<span style="font-size:10px;color:var(--text3)">${new Date(t.date).toLocaleDateString('en-IN',{month:'short',day:'numeric'})}</span>` : ''}
          </div>
        </div>
      </div>
      ${t.questions ? `
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:10px;color:var(--text3)">Questions</span>
            <span style="font-family:var(--font-mono);font-size:10px;color:var(--text2)">${t.questionsCompleted||0}/${t.questions}</span>
          </div>
          <div class="progress-wrap" style="height:5px">
            <div class="progress-bar" style="background:${subColor};width:${qPct}%;transition:width 0.8s cubic-bezier(0.34,1.2,0.64,1)"></div>
          </div>
        </div>` : ''}
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${t.status !== 'inprogress' && t.status !== 'done' ? `<button class="btn btn-sm" style="background:rgba(255,179,71,0.15);color:var(--amber);border:1px solid rgba(255,179,71,0.25);font-size:10px;padding:4px 10px" onclick="APP.pageInits.tasks.moveTask(${t.id},'inprogress')">Start</button>` : ''}
        ${t.status !== 'done' ? `<button class="btn btn-sm btn-success" style="font-size:10px;padding:4px 10px" onclick="APP.pageInits.tasks.moveTask(${t.id},'done')">Done</button>` : ''}
        ${t.status === 'done' ? `<button class="btn btn-sm btn-ghost" style="font-size:10px;padding:4px 10px" onclick="APP.pageInits.tasks.moveTask(${t.id},'todo')">Reopen</button>` : ''}
        <button class="btn btn-sm" style="font-size:10px;padding:4px 10px;background:rgba(108,99,255,0.1);color:var(--indigo2);border:1px solid rgba(108,99,255,0.2)" onclick="APP.pageInits.tasks.editQs(${t.id})">Update Qs</button>
        <button class="btn btn-sm btn-danger" style="font-size:10px;padding:4px 10px;margin-left:auto" onclick="APP.pageInits.tasks.deleteTask(${t.id})">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        </button>
      </div>
    `;
    el.addEventListener('mouseenter', () => { el.style.borderColor = 'var(--border2)'; el.style.transform = 'translateY(-2px)'; });
    el.addEventListener('mouseleave', () => { el.style.borderColor = 'var(--border)'; el.style.transform = 'translateY(0)'; });
    return el;
  },

  moveTask(id, newStatus) {
    const t = APP.data.tasks.find(t => t.id === id);
    if (!t) return;
    t.status = newStatus;
    if (newStatus === 'done') t.questionsCompleted = t.questions || 0;
    saveData(); this.populateTasks();
    toast(newStatus === 'done' ? 'Task completed!' : 'Task updated', 'success');
    if (newStatus === 'done') window.jee.sendNotification('Task Done', `"${t.title}" completed!`);
  },

  editQs(id) {
    const t = APP.data.tasks.find(t => t.id === id);
    if (!t) return;
    openModal(`
      <div class="modal-header">
        <div class="modal-title">Update Questions</div>
        <div class="modal-close" onclick="closeModal()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <p style="color:var(--text2);font-size:13px">${t.title}</p>
        <div class="input-group">
          <label class="input-label">Questions Completed</label>
          <input type="number" class="input" id="eq-completed" value="${t.questionsCompleted||0}" min="0" max="${t.questions||9999}">
        </div>
        <div class="input-group">
          <label class="input-label">Total Questions</label>
          <input type="number" class="input" id="eq-total" value="${t.questions||0}" min="0">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="APP.pageInits.tasks.saveQs(${id})">Save</button>
      </div>
    `);
  },

  saveQs(id) {
    const t = APP.data.tasks.find(t => t.id === id);
    t.questionsCompleted = parseInt(document.getElementById('eq-completed').value)||0;
    t.questions = parseInt(document.getElementById('eq-total').value)||0;
    saveData(); closeModal(); this.populateTasks();
    toast('Updated!', 'success');
  },

  deleteTask(id) {
    APP.data.tasks = APP.data.tasks.filter(t => t.id !== id);
    saveData(); this.populateTasks(); toast('Task deleted');
  },

  addModal() {
    openModal(`
      <div class="modal-header">
        <div class="modal-title">Add New Task</div>
        <div class="modal-close" onclick="closeModal()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="input-group">
          <label class="input-label">Title</label>
          <input class="input" id="nt-title" placeholder="e.g. Rotational Motion DPP #4">
        </div>
        <div class="grid-2" style="gap:12px">
          <div class="input-group">
            <label class="input-label">Subject</label>
            <select class="select" id="nt-sub"><option>Physics</option><option>Chemistry</option><option>Mathematics</option></select>
          </div>
          <div class="input-group">
            <label class="input-label">Type</label>
            <select class="select" id="nt-type"><option>DPP</option><option>Module</option><option>Self Study</option><option>Revision</option><option>Mock</option></select>
          </div>
        </div>
        <div class="input-group">
          <label class="input-label">Questions Assigned</label>
          <input type="number" class="input" id="nt-qs" placeholder="30" min="0">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="APP.pageInits.tasks.saveNew()">Add Task</button>
      </div>
    `);
  },

  saveNew() {
    const title = document.getElementById('nt-title').value.trim();
    if (!title) { toast('Enter a title', 'error'); return; }
    APP.data.tasks.push({
      id: Date.now(), title,
      subject: document.getElementById('nt-sub').value,
      type: document.getElementById('nt-type').value,
      questions: parseInt(document.getElementById('nt-qs').value)||0,
      questionsCompleted: 0, status: 'todo',
      createdAt: new Date().toISOString()
    });
    saveData(); closeModal(); this.populateTasks(); toast('Task added!', 'success');
  }
};
