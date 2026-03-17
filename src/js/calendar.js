APP.pageInits['calendar'] = {
  initialized: false,
  weekOffset: 0,

  init() { this.render(); },
  refresh() { this.render(); },

  getWeekDays(offset=0) {
    const days = [];
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7);
    for (let i=0; i<7; i++) {
      const d = new Date(monday); d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  },

  render() {
    const pg = document.getElementById('page-calendar');
    const days = this.getWeekDays(this.weekOffset);
    const today = new Date().toDateString();

    pg.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">Weekly Planner</div>
          <div class="page-subtitle">Plan your DPPs, modules and self-study sessions</div>
        </div>
        <div style="display:flex;gap:10px;align-items:center">
          <button class="btn btn-ghost btn-sm" onclick="APP.pageInits.calendar.prevWeek()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style="font-family:var(--font-mono);font-size:12px;color:var(--text2);min-width:120px;text-align:center" id="week-label"></span>
          <button class="btn btn-ghost btn-sm" onclick="APP.pageInits.calendar.nextWeek()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button class="btn btn-primary btn-sm" onclick="APP.pageInits.calendar.addTaskModal()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Task
          </button>
        </div>
      </div>

      <!-- Week Grid -->
      <div id="cal-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:10px;animation:fadeSlideUp 0.4s ease both"></div>
    `;

    // Week label
    const first = days[0], last = days[6];
    document.getElementById('week-label').textContent = `${first.toLocaleDateString('en-IN',{month:'short',day:'numeric'})} – ${last.toLocaleDateString('en-IN',{month:'short',day:'numeric'})}`;

    const grid = document.getElementById('cal-grid');
    days.forEach((d, i) => {
      const key = d.toISOString().split('T')[0];
      const tasks = (APP.data.calendar[key] || []);
      const isToday = d.toDateString() === today;

      const col = document.createElement('div');
      col.className = 'card';
      col.style.cssText = `padding:14px;min-height:280px;animation:fadeSlideUp 0.4s ease ${0.05*i}s both;${isToday ? 'border-color:rgba(108,99,255,0.4);background:rgba(108,99,255,0.04)' : ''}`;

      col.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div>
            <div style="font-family:var(--font-display);font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.1em">${d.toLocaleDateString('en-IN',{weekday:'short'})}</div>
            <div style="font-family:var(--font-mono);font-size:22px;font-weight:700;color:${isToday ? 'var(--indigo2)' : 'var(--text)'};">${d.getDate()}</div>
            ${isToday ? '<div style="font-size:10px;color:var(--indigo);font-weight:600;letter-spacing:0.05em">TODAY</div>' : ''}
          </div>
          <button onclick="APP.pageInits.calendar.addTaskModal('${key}')" style="width:24px;height:24px;border-radius:50%;background:var(--bg3);border:1px solid var(--border2);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text3);transition:all 0.2s" onmouseover="this.style.background='var(--indigo)';this.style.color='#fff'" onmouseout="this.style.background='var(--bg3)';this.style.color='var(--text3)'">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
        <div class="cal-tasks" id="cal-${key}" style="display:flex;flex-direction:column;gap:5px;flex:1"></div>
        ${tasks.length ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border);font-family:var(--font-mono);font-size:10px;color:var(--text3)">${tasks.reduce((a,t)=>a+(parseInt(t.questions)||0),0)} Qs total</div>` : ''}
      `;

      grid.appendChild(col);

      // Render tasks
      const taskContainer = col.querySelector(`#cal-${key}`);
      tasks.forEach((t, ti) => {
        const subColor = { Physics: 'var(--indigo)', Chemistry: 'var(--cyan)', Mathematics: 'var(--pink)' }[t.subject] || 'var(--text3)';
        const chip = document.createElement('div');
        chip.style.cssText = `padding:7px 10px;border-radius:7px;background:var(--bg3);border:1px solid var(--border);cursor:pointer;transition:all 0.2s;animation:fadeSlideUp 0.3s ease ${0.05*ti}s both`;
        chip.innerHTML = `
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:4px">
            <div style="min-width:0">
              <div style="font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text)">${t.title}</div>
              <div style="display:flex;align-items:center;gap:4px;margin-top:3px">
                <span style="font-size:10px;color:${subColor};font-weight:500">${t.subject||'General'}</span>
                <span style="font-size:10px;color:var(--text3)">· ${t.questions||0}Q</span>
                ${t.type ? `<span style="font-size:10px;color:var(--text3)">· ${t.type}</span>` : ''}
              </div>
            </div>
            <button onclick="APP.pageInits.calendar.removeTask('${key}',${ti})" style="background:none;border:none;cursor:pointer;color:var(--text3);padding:0;line-height:1;flex-shrink:0;opacity:0;transition:opacity 0.2s" class="del-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        `;
        chip.addEventListener('mouseenter', () => chip.querySelector('.del-btn').style.opacity='1');
        chip.addEventListener('mouseleave', () => chip.querySelector('.del-btn').style.opacity='0');
        taskContainer.appendChild(chip);
      });

      if (!tasks.length) {
        taskContainer.innerHTML = `<div style="font-size:11px;color:var(--text3);text-align:center;padding:20px 0;opacity:0.5">No tasks</div>`;
      }
    });
  },

  prevWeek() { this.weekOffset--; this.render(); },
  nextWeek() { this.weekOffset++; this.render(); },

  addTaskModal(dateKey) {
    const days = this.getWeekDays(this.weekOffset);
    const dayOptions = days.map(d => {
      const key = d.toISOString().split('T')[0];
      return `<option value="${key}" ${key === dateKey ? 'selected' : ''}>${d.toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'})}</option>`;
    }).join('');

    openModal(`
      <div class="modal-header">
        <div class="modal-title">Add Task to Calendar</div>
        <div class="modal-close" onclick="closeModal()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="input-group">
          <label class="input-label">Task Title</label>
          <input class="input" id="ct-title" placeholder="e.g. Kinematics DPP #3">
        </div>
        <div class="grid-2" style="gap:12px">
          <div class="input-group">
            <label class="input-label">Subject</label>
            <select class="select" id="ct-sub">
              <option>Physics</option><option>Chemistry</option><option>Mathematics</option>
            </select>
          </div>
          <div class="input-group">
            <label class="input-label">Type</label>
            <select class="select" id="ct-type">
              <option value="DPP">DPP</option>
              <option value="Module">Module</option>
              <option value="Self Study">Self Study</option>
              <option value="Revision">Revision</option>
              <option value="Mock">Mock</option>
            </select>
          </div>
        </div>
        <div class="grid-2" style="gap:12px">
          <div class="input-group">
            <label class="input-label">Questions Assigned</label>
            <input type="number" class="input" id="ct-qs" placeholder="30" min="0">
          </div>
          <div class="input-group">
            <label class="input-label">Day</label>
            <select class="select" id="ct-day">${dayOptions}</select>
          </div>
        </div>
        <div class="input-group">
          <label class="input-label">Notes (optional)</label>
          <textarea class="textarea" id="ct-notes" placeholder="Any specific topics or instructions..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="APP.pageInits.calendar.saveTask()">Add Task</button>
      </div>
    `);
  },

  saveTask() {
    const title = document.getElementById('ct-title').value.trim();
    if (!title) { toast('Enter a task title', 'error'); return; }
    const dateKey = document.getElementById('ct-day').value;
    if (!APP.data.calendar[dateKey]) APP.data.calendar[dateKey] = [];
    APP.data.calendar[dateKey].push({
      title,
      subject: document.getElementById('ct-sub').value,
      type: document.getElementById('ct-type').value,
      questions: parseInt(document.getElementById('ct-qs').value) || 0,
      notes: document.getElementById('ct-notes').value,
    });

    // Also add to tasks tracker
    APP.data.tasks.push({
      id: Date.now(),
      title,
      subject: document.getElementById('ct-sub').value,
      type: document.getElementById('ct-type').value,
      questions: parseInt(document.getElementById('ct-qs').value) || 0,
      questionsCompleted: 0,
      status: 'todo',
      date: dateKey,
      createdAt: new Date().toISOString(),
      notes: document.getElementById('ct-notes').value
    });

    saveData(); closeModal(); toast('Task added!', 'success');
    this.render();
  },

  removeTask(dateKey, idx) {
    APP.data.calendar[dateKey].splice(idx, 1);
    saveData(); this.render(); toast('Task removed');
  }
};
