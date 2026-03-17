APP.pageInits['resources'] = {
  initialized: false,
  search: '',
  filterType: 'All',
  embedUrl: null,

  init() { this.render(); },
  refresh() {},

  render() {
    const pg = document.getElementById('page-resources');
    pg.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">Resource Hub</div>
          <div class="page-subtitle">PDFs, links, notes and embedded websites in one place</div>
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn btn-ghost btn-sm" onclick="APP.pageInits.resources.embedModal()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
            Embed Site
          </button>
          <button class="btn btn-primary btn-sm" onclick="APP.pageInits.resources.addModal()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Resource
          </button>
        </div>
      </div>

      <!-- Embedded Webview -->
      <div id="embed-container" style="${this.embedUrl ? '' : 'display:none'}">
        <div class="card" style="padding:0;overflow:hidden;margin-bottom:20px;height:500px">
          <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg3);border-bottom:1px solid var(--border)">
            <div style="font-family:var(--font-mono);font-size:11px;color:var(--text3);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${this.embedUrl||''}</div>
            <button class="btn btn-ghost btn-sm" onclick="APP.pageInits.resources.saveEmbedModal()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Save
            </button>
            <button class="btn btn-ghost btn-sm" onclick="APP.pageInits.resources.goFullscreen()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              Fullscreen
            </button>
            <button class="btn btn-ghost btn-sm" onclick="APP.pageInits.resources.closeEmbed()">Close</button>
          </div>
          <webview id="resource-webview" src="${this.embedUrl||''}" style="width:100%;height:calc(100% - 44px);border:none;background:#ffffff"></webview>
        </div>
      </div>

      <!-- Search + Filter -->
      <div style="display:flex;gap:12px;margin-bottom:20px;animation:fadeSlideUp 0.3s ease both">
        <div style="position:relative;flex:1">
          <svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);opacity:0.4" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="input" style="padding-left:36px" placeholder="Search resources..." id="res-search" value="${this.search}" oninput="APP.pageInits.resources.onSearch(this.value)">
        </div>
        <div class="tab-bar">
          ${['All','PDF','Link','Note','Video','Embed'].map(t =>
            `<button class="tab-btn ${this.filterType===t?'active':''}" onclick="APP.pageInits.resources.setFilter('${t}')">${t}</button>`
          ).join('')}
        </div>
      </div>

      <!-- Resources Grid -->
      <div id="resources-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;animation:fadeSlideUp 0.4s ease 0.1s both"></div>
    `;
    this.renderGrid();
  },

  goFullscreen() {
    if (!this.embedUrl) return;
    // Remove any existing overlay
    const old = document.getElementById('embed-fullscreen-overlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'embed-fullscreen-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:9999;
      display:flex;flex-direction:column;
      background:#000;
    `;

    overlay.innerHTML = `
      <div style="
        display:flex;align-items:center;gap:10px;
        padding:8px 14px;
        background:var(--bg3);
        border-bottom:1px solid var(--border);
        flex-shrink:0;
        -webkit-app-region:no-drag;
      ">
        <div style="
          width:10px;height:10px;border-radius:50%;
          background:var(--indigo);
          box-shadow:0 0 8px var(--indigo);
          flex-shrink:0;
        "></div>
        <div style="font-family:var(--font-mono);font-size:11px;color:var(--text3);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          ${this.embedUrl}
        </div>
        <button onclick="APP.pageInits.resources.exitFullscreen()" style="
          display:flex;align-items:center;gap:6px;
          padding:5px 12px;border-radius:6px;
          background:rgba(255,255,255,0.06);
          border:1px solid var(--border2);
          color:var(--text2);font-size:12px;
          cursor:pointer;font-family:var(--font-body);
          transition:all 0.2s;
        " onmouseenter="this.style.background='rgba(255,255,255,0.12)';this.style.color='var(--text)'"
           onmouseleave="this.style.background='rgba(255,255,255,0.06)';this.style.color='var(--text2)'">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="21" y2="3"/><line x1="3" y1="21" x2="14" y2="10"/></svg>
          Exit Fullscreen
        </button>
      </div>
      <webview
        src="${this.embedUrl}"
        style="flex:1;width:100%;border:none;background:#ffffff;"
      ></webview>
    `;

    document.body.appendChild(overlay);
  },

  exitFullscreen() {
    const overlay = document.getElementById('embed-fullscreen-overlay');
    if (overlay) overlay.remove();
  },

  saveEmbedModal() {
    const url = this.embedUrl;
    if (!url) return;
    openModal(`
      <div class="modal-header">
        <div class="modal-title">Save Embed</div>
        <div class="modal-close" onclick="closeModal()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="input-group">
          <label class="input-label">Title</label>
          <input class="input" id="se-title" placeholder="e.g. Mission Jeet" value="${url.replace(/https?:\/\//, '').split('/')[0]}">
        </div>
        <div class="input-group">
          <label class="input-label">Subject</label>
          <select class="select" id="se-sub">
            <option>Physics</option><option>Chemistry</option><option>Mathematics</option><option>General</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Tags</label>
          <input class="input" id="se-tags" placeholder="revision, practice...">
        </div>
        <div style="font-size:11px;color:var(--text3);background:var(--bg3);border-radius:var(--r-sm);padding:10px 12px;font-family:var(--font-mono)">${url}</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="APP.pageInits.resources.saveEmbed('${encodeURIComponent(url)}')">Save</button>
      </div>
    `);
  },

  saveEmbed(encodedUrl) {
    const title = document.getElementById('se-title').value.trim();
    if (!title) { toast('Enter a title', 'error'); return; }
    const url = decodeURIComponent(encodedUrl);
    const exists = (APP.data.resources || []).some(r => r.type === 'Embed' && r.url === url);
    if (exists) { toast('Already saved!', 'warning'); closeModal(); return; }
    APP.data.resources.push({
      title,
      type:    'Embed',
      subject: document.getElementById('se-sub').value,
      url,
      tags:    document.getElementById('se-tags').value.trim(),
      note:    '',
      addedAt: new Date().toISOString()
    });
    saveData(); closeModal(); this.renderGrid();
    toast('Embed saved!', 'success');
  },

  renderGrid() {
    const grid = document.getElementById('resources-grid');
    if (!grid) return;
    let items = APP.data.resources || [];
    if (this.search) {
      const q = this.search.toLowerCase();
      items = items.filter(r => r.title.toLowerCase().includes(q) || (r.tags||'').toLowerCase().includes(q) || (r.url||'').toLowerCase().includes(q));
    }
    if (this.filterType !== 'All') items = items.filter(r => r.type === this.filterType);

    if (!items.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;padding:60px 0">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
        <p>No resources found</p>
        <button class="btn btn-primary btn-sm" onclick="APP.pageInits.resources.addModal()">Add First Resource</button>
      </div>`;
      return;
    }

    grid.innerHTML = items.map((r, i) => {
      const typeIcon = {
        PDF:   `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
        Link:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="1.5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
        Note:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" stroke-width="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
        Video: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--pink)" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
        Embed: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,
      }[r.type] || '';

      const subColor = { Physics:'var(--indigo)', Chemistry:'var(--cyan)', Mathematics:'var(--pink)', General:'var(--text3)' }[r.subject] || 'var(--text3)';
      const isEmbed = r.type === 'Embed';

      return `<div class="card" style="animation:fadeSlideUp 0.3s ease ${0.03*i}s both;cursor:pointer" onmouseenter="this.style.borderColor='var(--border2)'" onmouseleave="this.style.borderColor='var(--border)'" ${isEmbed ? `onclick="APP.pageInits.resources.open('${encodeURIComponent(r.url)}','Embed')"` : ''}>
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
          <div style="width:36px;height:36px;background:var(--bg3);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${typeIcon}</div>
          <div style="display:flex;gap:6px">
            ${r.url && !isEmbed ? `<button class="btn btn-ghost btn-sm" style="padding:5px 8px" onclick="APP.pageInits.resources.open('${encodeURIComponent(r.url)}','${r.type}')" title="Open">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </button>` : ''}
            ${isEmbed ? `<button class="btn btn-ghost btn-sm" style="padding:5px 8px" onclick="event.stopPropagation();APP.pageInits.resources.open('${encodeURIComponent(r.url)}','Embed')" title="Open">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>` : ''}
            <button class="btn btn-danger btn-sm" style="padding:5px 8px" onclick="event.stopPropagation();APP.pageInits.resources.delete(${i})">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
            </button>
          </div>
        </div>
        <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px;line-height:1.3">${r.title}</div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap">
          <span class="badge badge-indigo" style="font-size:10px">${r.type}</span>
          <span style="font-size:11px;color:${subColor}">${r.subject||'General'}</span>
        </div>
        ${isEmbed && r.url ? `<div style="font-size:10px;color:var(--text3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:4px">${r.url}</div>` : ''}
        ${r.tags ? `<div style="font-size:10px;color:var(--text3);line-height:1.5">${r.tags}</div>` : ''}
        ${r.note ? `<div style="font-size:11px;color:var(--text3);margin-top:6px;border-top:1px solid var(--border);padding-top:6px;line-height:1.5">${r.note}</div>` : ''}
        <div style="font-size:10px;color:var(--text3);margin-top:8px">${new Date(r.addedAt||0).toLocaleDateString('en-IN')}</div>
      </div>`;
    }).join('');
  },

  onSearch(val) { this.search = val; this.renderGrid(); },
  setFilter(type) { this.filterType = type; this.render(); },

  open(encodedUrl, type) {
    const url = decodeURIComponent(encodedUrl);
    if (type === 'Link') {
      window.jee.openExternal(url);
    } else {
      this.embedUrl = url;
      this.render();
    }
  },

  closeEmbed() { this.embedUrl = null; this.render(); },

  delete(i) {
    let items = APP.data.resources || [];
    const visible = this.filterType === 'All' ? items : items.filter(r => r.type === this.filterType);
    const item = visible[i];
    APP.data.resources = APP.data.resources.filter(r => r !== item);
    saveData(); this.renderGrid(); toast('Deleted');
  },

  embedModal() {
    openModal(`
      <div class="modal-header">
        <div class="modal-title">Embed Website</div>
        <div class="modal-close" onclick="closeModal()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <p style="font-size:13px;color:var(--text2)">Embed any website directly in the app. Note: some sites block embedding.</p>
        <div class="input-group">
          <label class="input-label">URL</label>
          <input class="input" id="emb-url" placeholder="https://missionjeet.in" value="https://missionjeet.in">
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="btn btn-ghost btn-sm" style="text-align:left" onclick="document.getElementById('emb-url').value='https://missionjeet.in'">missionjeet.in</button>
          <button class="btn btn-ghost btn-sm" style="text-align:left" onclick="document.getElementById('emb-url').value='https://www.jeemain.nta.nic.in'">JEE Main NTA</button>
          <button class="btn btn-ghost btn-sm" style="text-align:left" onclick="document.getElementById('emb-url').value='https://www.askiitians.com'">AskIITians</button>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="APP.pageInits.resources.openEmbed()">Open</button>
      </div>
    `);
  },

  openEmbed() {
    const url = document.getElementById('emb-url').value.trim();
    if (!url) { toast('Enter URL', 'error'); return; }
    this.embedUrl = url.startsWith('http') ? url : 'https://'+url;
    closeModal(); this.render();
  },

  addModal() {
    openModal(`
      <div class="modal-header">
        <div class="modal-title">Add Resource</div>
        <div class="modal-close" onclick="closeModal()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="input-group">
          <label class="input-label">Title</label>
          <input class="input" id="nr-title" placeholder="e.g. HC Verma Chapter 5 Notes">
        </div>
        <div class="grid-2" style="gap:12px">
          <div class="input-group">
            <label class="input-label">Type</label>
            <select class="select" id="nr-type">
              <option>PDF</option><option>Link</option><option>Note</option><option>Video</option>
            </select>
          </div>
          <div class="input-group">
            <label class="input-label">Subject</label>
            <select class="select" id="nr-sub">
              <option>Physics</option><option>Chemistry</option><option>Mathematics</option><option>General</option>
            </select>
          </div>
        </div>
        <div class="input-group">
          <label class="input-label">URL / Link (optional)</label>
          <input class="input" id="nr-url" placeholder="https://...">
        </div>
        <div class="input-group">
          <label class="input-label">Tags</label>
          <input class="input" id="nr-tags" placeholder="mechanics, kinematics, revision">
        </div>
        <div class="input-group">
          <label class="input-label">Notes</label>
          <textarea class="textarea" id="nr-note" placeholder="Any additional notes..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="APP.pageInits.resources.save()">Add Resource</button>
      </div>
    `);
  },

  save() {
    const title = document.getElementById('nr-title').value.trim();
    if (!title) { toast('Enter a title', 'error'); return; }
    APP.data.resources.push({
      title,
      type:    document.getElementById('nr-type').value,
      subject: document.getElementById('nr-sub').value,
      url:     document.getElementById('nr-url').value.trim(),
      tags:    document.getElementById('nr-tags').value.trim(),
      note:    document.getElementById('nr-note').value.trim(),
      addedAt: new Date().toISOString()
    });
    saveData(); closeModal(); this.renderGrid();
    toast('Resource added!', 'success');
  }
};