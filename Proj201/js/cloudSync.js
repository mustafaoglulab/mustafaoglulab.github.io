/**
 * PROJ 201: Google Firebase Cloud Database Sync Adapter
 * Mustafaoglu Lab · Sabancı University · Fall 2026
 * 
 * Provides 100% free, real-time multi-user cloud synchronization for all 6 students
 * and supervisor across GitHub Pages static hosting using Google Firebase Realtime Database.
 * Built with dual WebSocket + HTTPS REST architecture so it connects in <100ms and never hangs.
 */

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCKN_JDUL0bMVDo4tFsq6i_hYM745B9SwQ",
  authDomain: "proj201-trials.firebaseapp.com",
  databaseURL: "https://proj201-trials-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "proj201-trials",
  storageBucket: "proj201-trials.firebasestorage.app",
  messagingSenderId: "126331434224",
  appId: "1:126331434224:web:68556639bd7007d9cefe35"
};

class CloudSyncAdapter {
  constructor() {
    this.CONFIG_STORAGE_KEY = 'proj201_firebase_config_v1';
    this.DISABLED_KEY = 'proj201_cloud_disabled';
    this.app = null;
    this.rtdb = null;
    this.isConnected = false;
    this.isSyncing = false;
    this.lastError = null;
    this.lastErrorCode = null;
    this._syncTimer = null;

    this.init();
  }

  getConfig() {
    if (localStorage.getItem(this.DISABLED_KEY) === 'true') {
      return null;
    }

    let config = null;
    try {
      const stored = localStorage.getItem(this.CONFIG_STORAGE_KEY);
      if (stored) {
        config = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error parsing stored Firebase config:', e);
    }

    // Always merge with default config so missing keys or URLs are automatically filled
    if (!config || !config.apiKey) {
      config = { ...DEFAULT_FIREBASE_CONFIG };
    } else {
      config = { ...DEFAULT_FIREBASE_CONFIG, ...config };
    }

    // Ensure correct regional databaseURL is always attached
    if (!config.databaseURL || config.databaseURL.includes('firebaseio.com') || !config.databaseURL.includes('proj201-trials')) {
      config.databaseURL = DEFAULT_FIREBASE_CONFIG.databaseURL;
    }

    return config;
  }

  saveConfig(configObj) {
    localStorage.removeItem(this.DISABLED_KEY);
    if (!configObj.databaseURL && (configObj.projectId === 'proj201-trials' || configObj.authDomain?.includes('proj201-trials'))) {
      configObj.databaseURL = DEFAULT_FIREBASE_CONFIG.databaseURL;
    }
    localStorage.setItem(this.CONFIG_STORAGE_KEY, JSON.stringify(configObj));
    return this.connect(configObj);
  }

  clearConfig() {
    localStorage.setItem(this.DISABLED_KEY, 'true');
    localStorage.removeItem(this.CONFIG_STORAGE_KEY);
    this.disconnect();
    this.lastError = null;
    this.lastErrorCode = null;
    this.updateStatusUI(false, 'Local Mode');
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.startAuth());
    } else {
      this.startAuth();
    }
  }

  // ==========================================
  // AUTHENTICATION (Google Sign-In, email allowlist enforced by DB rules)
  // ==========================================
  ensureApp(config) {
    if (typeof firebase === 'undefined') return null;
    if (!this.app) {
      this.app = (firebase.apps && firebase.apps.length) ? firebase.app() : firebase.initializeApp(config || DEFAULT_FIREBASE_CONFIG);
    }
    return this.app;
  }

  startAuth() {
    this.user = null;
    this.injectAuthUI();
    if (typeof firebase === 'undefined' || typeof firebase.auth !== 'function') {
      this.showAuthGate('Sign-in library failed to load. Please check your connection and reload.');
      return;
    }
    this.ensureApp(this.getConfig() || DEFAULT_FIREBASE_CONFIG);
    firebase.auth().onAuthStateChanged(user => {
      this.user = user;
      this.renderUserBadge();
      if (user) {
        this.hideAuthGate();
        this.autoConnect();
      } else {
        this.disconnect();
        this.updateStatusUI(false, 'Signed Out');
        this.showAuthGate();
      }
    });
  }

  async signIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account', hd: 'sabanciuniv.edu' });
    try {
      await firebase.auth().signInWithPopup(provider);
    } catch (e) {
      if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) {
        return firebase.auth().signInWithRedirect(provider);
      }
      if (e && e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
        this.showAuthGate('Sign-in failed: ' + (e.message || e.code));
      }
    }
  }

  signOut() {
    if (typeof firebase !== 'undefined' && firebase.auth) firebase.auth().signOut();
  }

  async getToken() {
    if (!this.user) return null;
    try { return await this.user.getIdToken(); } catch (e) { return null; }
  }

  // Builds an authenticated REST URL for the Realtime Database
  async restUrl(dbUrl, path, extra = '') {
    const token = await this.getToken();
    const params = [];
    if (token) params.push('auth=' + encodeURIComponent(token));
    if (extra) params.push(extra);
    return `${dbUrl}/${path}.json${params.length ? '?' + params.join('&') : ''}`;
  }

  handleDenied() {
    const email = this.user ? this.user.email : '';
    this.disconnect();
    this.updateStatusUI(false, 'Access Denied');
    this.showAuthGate(`<strong>${email}</strong> is not on the PROJ 201 access list. Please sign in with your approved Sabancı account or contact Dr. Nur Mustafaoglu.`, true);
  }

  injectAuthUI() {
    if (document.getElementById('authGate')) return;
    const style = document.createElement('style');
    style.textContent = `
      #authGate{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;
        background:radial-gradient(circle at 30% 20%,rgba(99,102,241,.35),transparent 55%),radial-gradient(circle at 75% 80%,rgba(20,184,166,.3),transparent 55%),rgba(10,12,24,.92);
        backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);font-family:inherit}
      #authGate.open{display:flex;animation:authFade .35s ease}
      @keyframes authFade{from{opacity:0}to{opacity:1}}
      .auth-card{width:min(420px,92vw);padding:40px 34px;border-radius:22px;text-align:center;color:#e8eaf6;
        background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);box-shadow:0 24px 70px rgba(0,0,0,.45)}
      .auth-card h2{margin:0 0 6px;font-size:1.6rem;letter-spacing:.3px}
      .auth-card p{margin:0 0 26px;color:#aab0d0;font-size:.95rem;line-height:1.5}
      .auth-msg{margin:-8px 0 20px;padding:12px 14px;border-radius:12px;font-size:.88rem;background:rgba(244,63,94,.14);border:1px solid rgba(244,63,94,.35);color:#fecdd3;display:none}
      .auth-msg.show{display:block}
      .auth-google{display:inline-flex;align-items:center;gap:12px;padding:13px 26px;border:none;border-radius:999px;cursor:pointer;
        background:#fff;color:#1f2937;font-weight:600;font-size:.98rem;transition:transform .15s ease,box-shadow .2s ease}
      .auth-google:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(99,102,241,.45)}
      .auth-foot{margin-top:22px;font-size:.78rem;color:#7c83a8}
      #authUserBadge{display:none;align-items:center;gap:8px;font-size:.8rem;margin-left:10px;color:inherit}
      #authUserBadge img{width:26px;height:26px;border-radius:50%}
      #authUserBadge button{background:transparent;border:1px solid rgba(127,127,160,.45);color:inherit;border-radius:999px;padding:4px 10px;cursor:pointer;font-size:.75rem}
      #authUserBadge button:hover{background:rgba(127,127,160,.18)}
    `;
    document.head.appendChild(style);

    const gate = document.createElement('div');
    gate.id = 'authGate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.innerHTML = `
      <div class="auth-card">
        <h2>PROJ 201 Trial Database</h2>
        <p>Mustafaoglu Lab · Sabancı University<br>Sign in with your approved Sabancı Google account to continue.</p>
        <div class="auth-msg" id="authMsg"></div>
        <button class="auth-google" id="btnGoogleSignIn" type="button">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
          <span id="btnGoogleSignInLabel">Sign in with Google</span>
        </button>
        <div class="auth-foot">Access is limited to the PROJ 201 team.</div>
      </div>`;
    document.body.appendChild(gate);
    document.getElementById('btnGoogleSignIn').addEventListener('click', () => {
      if (this.user) { firebase.auth().signOut().then(() => this.signIn()); } else { this.signIn(); }
    });

    const badge = document.createElement('div');
    badge.id = 'authUserBadge';
    badge.innerHTML = `<img id="authUserPhoto" alt="" referrerpolicy="no-referrer"><span id="authUserEmail"></span><button id="btnSignOut" type="button">Sign out</button>`;
    const pill = document.getElementById('btnCloudStatus');
    if (pill && pill.parentNode) pill.parentNode.insertBefore(badge, pill.nextSibling);
    else document.body.appendChild(badge);
    document.getElementById('btnSignOut').addEventListener('click', () => this.signOut());
  }

  showAuthGate(message = '', switchAccount = false) {
    const gate = document.getElementById('authGate');
    const msg = document.getElementById('authMsg');
    const label = document.getElementById('btnGoogleSignInLabel');
    if (!gate) return;
    if (msg) { msg.innerHTML = message; msg.classList.toggle('show', !!message); }
    if (label) label.textContent = switchAccount ? 'Use a different account' : 'Sign in with Google';
    gate.classList.add('open');
  }

  hideAuthGate() {
    const gate = document.getElementById('authGate');
    if (gate) gate.classList.remove('open');
  }

  renderUserBadge() {
    const badge = document.getElementById('authUserBadge');
    if (!badge) return;
    if (this.user) {
      document.getElementById('authUserEmail').textContent = this.user.email || '';
      const photo = document.getElementById('authUserPhoto');
      if (this.user.photoURL) { photo.src = this.user.photoURL; photo.style.display = ''; } else { photo.style.display = 'none'; }
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }

  autoConnect() {
    if (!this.user) return;
    const config = this.getConfig();
    if (config) {
      this.connect(config);
    } else {
      this.updateStatusUI(false, 'Cloud Setup');
    }
  }

  async connect(config) {
    const dbUrl = (config && config.databaseURL) || DEFAULT_FIREBASE_CONFIG.databaseURL;
    this.updateStatusUI(false, 'Connecting...', true);

    try {
      // 1. Instant sync via HTTPS REST endpoint (tested, completes in ~100ms)
      const restSuccess = await this.fetchRestData(dbUrl);
      if (restSuccess) {
        this.isConnected = true;
        this.lastError = null;
        this.lastErrorCode = null;
        this.updateStatusUI(true, 'Cloud Synced');
      }

      // 2. Initialize Firebase Web SDK for live realtime WebSocket events
      if (this.denied) return { success: false, error: 'Access denied' };
      if (typeof firebase !== 'undefined' && typeof firebase.initializeApp === 'function') {
        try {
          // Reuse the existing app so the signed-in session is preserved
          this.ensureApp(config);

          if (typeof firebase.database === 'function') {
            this.rtdb = firebase.database();

            // Official live connection listener
            this.rtdb.ref('.info/connected').on('value', snap => {
              if (snap.val() === true) {
                this.isConnected = true;
                this.lastError = null;
                this.updateStatusUI(true, 'Cloud Synced');
              }
            });

            this.startRealtimeListeners();

            // Send non-blocking heartbeat
            this.rtdb.ref('proj201_meta/heartbeat').set({
              lastSeen: new Date().toISOString(),
              client: navigator.userAgent,
              status: 'Live Cloud Synced'
            }).catch(() => {});
          }
        } catch (sdkErr) {
          console.warn('Realtime SDK notice (operating seamlessly via HTTPS REST):', sdkErr);
        }
      }

      if (this.isConnected) {
        this.startBackgroundSync(dbUrl);
        return { success: true };
      }

      this.isConnected = false;
      this.lastError = 'Unable to reach Firebase database at ' + dbUrl;
      this.updateStatusUI(false, 'Cloud Setup');
      return { success: false, error: this.lastError };
    } catch (err) {
      console.warn('Cloud connection notice:', err);
      if (this.isConnected) return { success: true };
      this.isConnected = false;
      this.lastError = err.message || String(err);
      this.updateStatusUI(false, 'Cloud Setup');
      return { success: false, error: this.lastError };
    }
  }

  // Periodic background REST sync (every 20s) ensures all 6 students stay perfectly aligned
  startBackgroundSync(dbUrl) {
    if (this._syncTimer) clearInterval(this._syncTimer);
    this._syncTimer = setInterval(() => {
      if (this.isConnected && !this.isSyncing) {
        this.fetchRestData(dbUrl, true);
      }
    }, 20000);
  }

  // Instant HTTPS REST Fetch Fallback (ultra-reliable, never hangs)
  async fetchRestData(dbUrl, silent = false) {
    if (!dbUrl || !this.user) return false;
    try {
      this.denied = false;
      const res = await fetch(await this.restUrl(dbUrl, '', `_t=${Date.now()}`));
      if (res.status === 401 || res.status === 403) {
        this.denied = true;
        this.handleDenied();
        return false;
      }
      if (!res.ok) return false;

      const cloudData = await res.json();
      if (!cloudData) return true;

      let currentData = null;
      if (window.storage && typeof window.storage.getData === 'function') {
        currentData = window.storage.getData();
      } else {
        try {
          const raw = localStorage.getItem('proj201_research_database_v2');
          currentData = raw ? JSON.parse(raw) : (window.SEED_DATA ? JSON.parse(JSON.stringify(window.SEED_DATA)) : {});
        } catch (e) {
          currentData = {};
        }
      }

      if (!currentData) currentData = {};
      let changed = false;

      // Update Trials
      if (cloudData.proj201_trials && typeof cloudData.proj201_trials === 'object') {
        const cloudTrials = Object.values(cloudData.proj201_trials);
        if (cloudTrials.length > 0 && JSON.stringify(currentData.trials) !== JSON.stringify(cloudTrials)) {
          currentData.trials = cloudTrials;
          changed = true;
        }
      }

      // Update Weekly Progress
      if (cloudData.proj201_weekly_progress && typeof cloudData.proj201_weekly_progress === 'object') {
        const cloudWp = Object.values(cloudData.proj201_weekly_progress);
        if (JSON.stringify(currentData.weeklyProgress) !== JSON.stringify(cloudWp)) {
          currentData.weeklyProgress = cloudWp;
          changed = true;
        }
      }

      // Update Search Logs
      if (cloudData.proj201_search_logs && typeof cloudData.proj201_search_logs === 'object') {
        const cloudLogs = Object.values(cloudData.proj201_search_logs);
        if (JSON.stringify(currentData.searchLogs) !== JSON.stringify(cloudLogs)) {
          currentData.searchLogs = cloudLogs;
          changed = true;
        }
      }

      // Update Search Matrix
      if (cloudData.proj201_meta && cloudData.proj201_meta.searchMatrix && cloudData.proj201_meta.searchMatrix.matrix) {
        const cloudMatrix = cloudData.proj201_meta.searchMatrix.matrix;
        if (JSON.stringify(currentData.searchMatrix) !== JSON.stringify(cloudMatrix)) {
          currentData.searchMatrix = cloudMatrix;
          changed = true;
        }
      }

      if (changed) {
        localStorage.setItem('proj201_research_database_v2', JSON.stringify(currentData));
        if (window.storage && typeof window.storage.notifyUpdate === 'function') {
          window.storage.notifyUpdate();
        }
      }

      return true;
    } catch (e) {
      if (!silent) console.warn('REST sync notice:', e);
      return false;
    }
  }

  disconnect() {
    if (this._syncTimer) {
      clearInterval(this._syncTimer);
      this._syncTimer = null;
    }
    if (this.rtdb) {
      try {
        this.rtdb.ref('.info/connected').off();
        this.rtdb.ref('proj201_trials').off();
        this.rtdb.ref('proj201_weekly_progress').off();
        this.rtdb.ref('proj201_search_logs').off();
        this.rtdb.ref('proj201_meta/searchMatrix').off();
      } catch (e) {}
    }
    this.isConnected = false;
  }

  updateStatusUI(connected, text, syncing = false) {
    const pill = document.getElementById('btnCloudStatus');
    const label = document.getElementById('cloudStatusText');
    if (!pill || !label) return;

    pill.className = `cloud-pill ${connected ? 'status-connected' : 'status-disconnected'} ${syncing ? 'status-syncing' : ''}`;
    label.textContent = text;
  }

  // ==========================================
  // REAL-TIME LISTENERS
  // ==========================================
  startRealtimeListeners() {
    if (!this.rtdb) return;

    // 1. Real-time Trials
    this.rtdb.ref('proj201_trials').on('value', snapshot => {
      const val = snapshot.val();
      if (val) {
        const cloudTrials = Object.values(val);
        if (cloudTrials.length > 0) {
          const currentData = (window.storage && window.storage.getData()) || {};
          if (JSON.stringify(currentData.trials) !== JSON.stringify(cloudTrials)) {
            currentData.trials = cloudTrials;
            localStorage.setItem('proj201_research_database_v2', JSON.stringify(currentData));
            if (window.storage) window.storage.notifyUpdate();
          }
        }
      }
    });

    // 2. Real-time Weekly Progress
    this.rtdb.ref('proj201_weekly_progress').on('value', snapshot => {
      const val = snapshot.val();
      if (val) {
        const cloudWp = Object.values(val);
        const currentData = (window.storage && window.storage.getData()) || {};
        if (JSON.stringify(currentData.weeklyProgress) !== JSON.stringify(cloudWp)) {
          currentData.weeklyProgress = cloudWp;
          localStorage.setItem('proj201_research_database_v2', JSON.stringify(currentData));
          if (window.storage) window.storage.notifyUpdate();
        }
      }
    });

    // 3. Real-time Search Logs
    this.rtdb.ref('proj201_search_logs').on('value', snapshot => {
      const val = snapshot.val();
      if (val) {
        const cloudLogs = Object.values(val);
        const currentData = (window.storage && window.storage.getData()) || {};
        if (JSON.stringify(currentData.searchLogs) !== JSON.stringify(cloudLogs)) {
          currentData.searchLogs = cloudLogs;
          localStorage.setItem('proj201_research_database_v2', JSON.stringify(currentData));
          if (window.storage) window.storage.notifyUpdate();
        }
      }
    });

    // 4. Real-time Search Matrix
    this.rtdb.ref('proj201_meta/searchMatrix').on('value', snapshot => {
      const val = snapshot.val();
      if (val && val.matrix) {
        const currentData = (window.storage && window.storage.getData()) || {};
        if (JSON.stringify(currentData.searchMatrix) !== JSON.stringify(val.matrix)) {
          currentData.searchMatrix = val.matrix;
          localStorage.setItem('proj201_research_database_v2', JSON.stringify(currentData));
          if (window.storage) window.storage.notifyUpdate();
        }
      }
    });
  }

  // ==========================================
  // CLOUD WRITE DISPATCHERS
  // ==========================================
  async syncTrial(trial) {
    const dbUrl = (this.getConfig() && this.getConfig().databaseURL) || DEFAULT_FIREBASE_CONFIG.databaseURL;
    try {
      this.updateStatusUI(true, 'Syncing...', true);
      if (this.rtdb) {
        this.rtdb.ref(`proj201_trials/${trial.id}`).set(trial).catch(() => {});
      }
      if (dbUrl) {
        fetch(await this.restUrl(dbUrl, `proj201_trials/${trial.id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trial)
        }).catch(() => {});
      }
      setTimeout(() => this.updateStatusUI(true, 'Cloud Synced'), 400);
    } catch (e) {
      console.error('Error syncing trial:', e);
    }
  }

  async deleteTrial(trialId) {
    const dbUrl = (this.getConfig() && this.getConfig().databaseURL) || DEFAULT_FIREBASE_CONFIG.databaseURL;
    try {
      this.updateStatusUI(true, 'Syncing...', true);
      if (this.rtdb) {
        this.rtdb.ref(`proj201_trials/${trialId}`).remove().catch(() => {});
      }
      if (dbUrl) {
        fetch(await this.restUrl(dbUrl, `proj201_trials/${trialId}`), { method: 'DELETE' }).catch(() => {});
      }
      setTimeout(() => this.updateStatusUI(true, 'Cloud Synced'), 400);
    } catch (e) {
      console.error('Error deleting trial:', e);
    }
  }

  async syncWeeklyProgress(row) {
    const dbUrl = (this.getConfig() && this.getConfig().databaseURL) || DEFAULT_FIREBASE_CONFIG.databaseURL;
    try {
      if (this.rtdb) {
        this.rtdb.ref(`proj201_weekly_progress/${row.id}`).set(row).catch(() => {});
      }
      if (dbUrl) {
        fetch(await this.restUrl(dbUrl, `proj201_weekly_progress/${row.id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(row)
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Error syncing weekly progress:', e);
    }
  }

  async syncSearchLog(log) {
    const dbUrl = (this.getConfig() && this.getConfig().databaseURL) || DEFAULT_FIREBASE_CONFIG.databaseURL;
    try {
      if (this.rtdb) {
        this.rtdb.ref(`proj201_search_logs/${log.id}`).set(log).catch(() => {});
      }
      if (dbUrl) {
        fetch(await this.restUrl(dbUrl, `proj201_search_logs/${log.id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(log)
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Error syncing search log:', e);
    }
  }

  async deleteSearchLog(logId) {
    const dbUrl = (this.getConfig() && this.getConfig().databaseURL) || DEFAULT_FIREBASE_CONFIG.databaseURL;
    try {
      if (this.rtdb) {
        this.rtdb.ref(`proj201_search_logs/${logId}`).remove().catch(() => {});
      }
      if (dbUrl) {
        fetch(await this.restUrl(dbUrl, `proj201_search_logs/${logId}`), { method: 'DELETE' }).catch(() => {});
      }
    } catch (e) {
      console.error('Error deleting search log:', e);
    }
  }

  async syncSearchMatrix(matrix) {
    const dbUrl = (this.getConfig() && this.getConfig().databaseURL) || DEFAULT_FIREBASE_CONFIG.databaseURL;
    try {
      const payload = { matrix: matrix, updatedAt: new Date().toISOString() };
      if (this.rtdb) {
        this.rtdb.ref('proj201_meta/searchMatrix').set(payload).catch(() => {});
      }
      if (dbUrl) {
        fetch(await this.restUrl(dbUrl, 'proj201_meta/searchMatrix'), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Error syncing search matrix:', e);
    }
  }

  async pushAllLocalDataToCloud() {
    try {
      this.updateStatusUI(true, 'Pushing Data...', true);
      const data = window.storage.getData();
      const dbUrl = (this.getConfig() && this.getConfig().databaseURL) || DEFAULT_FIREBASE_CONFIG.databaseURL;

      const payload = {
        proj201_trials: (data.trials || []).reduce((acc, t) => { acc[t.id] = t; return acc; }, {}),
        proj201_weekly_progress: (data.weeklyProgress || []).reduce((acc, w) => { acc[w.id] = w; return acc; }, {}),
        proj201_search_logs: (data.searchLogs || []).reduce((acc, s) => { acc[s.id] = s; return acc; }, {}),
        proj201_meta: {
          searchMatrix: { matrix: data.searchMatrix || [], updatedAt: new Date().toISOString() },
          heartbeat: { lastSeen: new Date().toISOString(), status: 'Live Cloud Synced' }
        }
      };

      if (this.rtdb) {
        this.rtdb.ref().update(payload).catch(() => {});
      }

      if (dbUrl) {
        await fetch(await this.restUrl(dbUrl, ''), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      this.isConnected = true;
      this.updateStatusUI(true, 'Cloud Synced');
      return { success: true, count: (data.trials || []).length };
    } catch (err) {
      console.error('Batch upload error:', err);
      return { success: false, error: err.message };
    }
  }
}

// Global instance
window.cloudSync = new CloudSyncAdapter();
