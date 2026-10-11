/**
 * PROJ 201: Google Firebase Cloud Database Sync Adapter
 * Mustafaoglu Lab · Sabancı University · Fall 2026
 * 
 * Provides 100% free, real-time multi-user cloud synchronization for all 6 students
 * and supervisor across GitHub Pages static hosting using Google Cloud Firestore.
 */

// If you wish to hardcode the Firebase config so students do not need to configure anything,
// simply paste your firebaseConfig object below. Otherwise, it can be configured via the UI.
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCKN_JDUL0bMVDo4tFsq6i_hYM745B9SwQ",
  authDomain: "proj201-trials.firebaseapp.com",
  projectId: "proj201-trials",
  storageBucket: "proj201-trials.firebasestorage.app",
  messagingSenderId: "126331434224",
  appId: "1:126331434224:web:68556639bd7007d9cefe35"
};

class CloudSyncAdapter {
  constructor() {
    this.CONFIG_STORAGE_KEY = 'proj201_firebase_config_v1';
    this.DISABLED_KEY = 'proj201_cloud_disabled';
    this.db = null;
    this.app = null;
    this.isConnected = false;
    this.isSyncing = false;
    this.lastError = null;
    this.lastErrorCode = null;
    this.unsubscribes = [];

    // Collections
    this.COL_TRIALS = 'proj201_trials';
    this.COL_QC_LOG = 'proj201_qc_log';
    this.COL_SEARCH_LOGS = 'proj201_search_logs';
    this.COL_WEEKLY = 'proj201_weekly_progress';
    this.COL_META = 'proj201_meta';

    this.init();
  }

  getConfig() {
    // If user explicitly chose local mode, don't auto-connect
    if (localStorage.getItem(this.DISABLED_KEY) === 'true') {
      return null;
    }

    // 1. User-customized config in localStorage takes top priority
    try {
      const stored = localStorage.getItem(this.CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.apiKey) return parsed;
      }
    } catch (e) {
      console.error('Error parsing stored Firebase config:', e);
    }

    // 2. Fall back to project default config
    if (DEFAULT_FIREBASE_CONFIG && DEFAULT_FIREBASE_CONFIG.apiKey) {
      return DEFAULT_FIREBASE_CONFIG;
    }

    return null;
  }

  saveConfig(configObj) {
    localStorage.removeItem(this.DISABLED_KEY);
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
    const config = this.getConfig();
    if (config) {
      this.connect(config);
    } else {
      this.updateStatusUI(false, 'Cloud Setup');
    }
  }

  async connect(config) {
    if (typeof firebase === 'undefined') {
      console.warn('Firebase SDK not loaded.');
      this.lastError = 'Google Firebase SDK script is not loaded on page.';
      this.updateStatusUI(false, 'SDK Missing');
      return { success: false, error: this.lastError };
    }

    try {
      this.updateStatusUI(false, 'Connecting...', true);

      // Clean up previous apps before re-initializing
      if (firebase.apps && firebase.apps.length) {
        await Promise.all(firebase.apps.map(a => a.delete().catch(() => {})));
      }

      this.app = firebase.initializeApp(config);
      this.db = firebase.firestore();

      // Test connection with heartbeat document
      await this.db.collection(this.COL_META).doc('heartbeat').set({
        lastSeen: new Date().toISOString(),
        client: navigator.userAgent
      }, { merge: true });

      this.isConnected = true;
      this.lastError = null;
      this.lastErrorCode = null;
      this.updateStatusUI(true, 'Cloud Synced');
      this.startRealtimeListeners();

      return { success: true };
    } catch (err) {
      console.error('Firebase connection error:', err);
      this.isConnected = false;
      this.lastError = err.message || String(err);
      this.lastErrorCode = err.code || 'error';
      this.updateStatusUI(false, 'Cloud Setup');
      return { success: false, error: this.lastError };
    }
  }

  disconnect() {
    this.unsubscribes.forEach(unsub => {
      try { unsub(); } catch (e) {}
    });
    this.unsubscribes = [];
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
  // REAL-TIME FIRESTORE LISTENERS
  // ==========================================
  startRealtimeListeners() {
    if (!this.db || !this.isConnected) return;
    this.disconnect(); // Clean old listeners

    // 1. Listen to Clinical Trials
    const unsubTrials = this.db.collection(this.COL_TRIALS).onSnapshot(
      snapshot => {
        if (snapshot.empty && window.storage.getTrials().length > 0) {
          // If cloud collection is completely empty, offer to push initial seed trials
          return;
        }

        const cloudTrials = [];
        snapshot.forEach(doc => {
          cloudTrials.push(doc.data());
        });

        if (cloudTrials.length > 0) {
          const currentData = window.storage.getData();
          currentData.trials = cloudTrials;
          // Silent local save without re-triggering cloud write
          localStorage.setItem(window.storage.STORAGE_KEY, JSON.stringify(currentData));
          window.storage.notifyUpdate();
        }
      },
      err => console.error('Firestore trials subscription error:', err)
    );
    this.unsubscribes.push(unsubTrials);

    // 2. Listen to QC Log
    const unsubQc = this.db.collection(this.COL_QC_LOG).onSnapshot(
      snapshot => {
        const cloudLogs = [];
        snapshot.forEach(doc => cloudLogs.push(doc.data()));
        if (cloudLogs.length > 0) {
          cloudLogs.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          const currentData = window.storage.getData();
          currentData.qcLog = cloudLogs;
          localStorage.setItem(window.storage.STORAGE_KEY, JSON.stringify(currentData));
          window.storage.notifyUpdate();
        }
      },
      err => console.error('Firestore QC log error:', err)
    );
    this.unsubscribes.push(unsubQc);

    // 3. Listen to Search Logs
    const unsubSearch = this.db.collection(this.COL_SEARCH_LOGS).onSnapshot(
      snapshot => {
        const logs = [];
        snapshot.forEach(doc => logs.push(doc.data()));
        if (logs.length > 0) {
          const currentData = window.storage.getData();
          currentData.searchLogs = logs;
          localStorage.setItem(window.storage.STORAGE_KEY, JSON.stringify(currentData));
          window.storage.notifyUpdate();
        }
      },
      err => console.error('Firestore search logs error:', err)
    );
    this.unsubscribes.push(unsubSearch);

    // 4. Listen to Weekly Progress
    const unsubWeekly = this.db.collection(this.COL_WEEKLY).onSnapshot(
      snapshot => {
        const reports = [];
        snapshot.forEach(doc => reports.push(doc.data()));
        if (reports.length > 0) {
          const currentData = window.storage.getData();
          currentData.weeklyProgress = reports;
          localStorage.setItem(window.storage.STORAGE_KEY, JSON.stringify(currentData));
          window.storage.notifyUpdate();
        }
      },
      err => console.error('Firestore weekly reports error:', err)
    );
    this.unsubscribes.push(unsubWeekly);

    // 5. Listen to Tasks and Checklist
    const unsubTasks = this.db.collection(this.COL_META).doc('tasks').onSnapshot(
      doc => {
        if (doc.exists) {
          const meta = doc.data();
          const currentData = window.storage.getData();
          if (meta.weeks) currentData.weeks = meta.weeks;
          if (meta.finalChecklist) currentData.finalChecklist = meta.finalChecklist;
          localStorage.setItem(window.storage.STORAGE_KEY, JSON.stringify(currentData));
          window.storage.notifyUpdate();
        }
      },
      err => console.error('Firestore tasks sync error:', err)
    );
    this.unsubscribes.push(unsubTasks);
  }

  // ==========================================
  // CLOUD WRITE DISPATCHERS
  // ==========================================
  async syncTrial(trial) {
    if (!this.isConnected || !this.db) return;
    try {
      this.updateStatusUI(true, 'Syncing...', true);
      await this.db.collection(this.COL_TRIALS).doc(trial.id).set(trial, { merge: true });
      this.updateStatusUI(true, 'Cloud Synced');
    } catch (e) {
      console.error('Error syncing trial to cloud:', e);
      this.updateStatusUI(false, 'Sync Failed');
    }
  }

  async deleteTrial(trialId) {
    if (!this.isConnected || !this.db) return;
    try {
      this.updateStatusUI(true, 'Syncing...', true);
      await this.db.collection(this.COL_TRIALS).doc(trialId).delete();
      this.updateStatusUI(true, 'Cloud Synced');
    } catch (e) {
      console.error('Error deleting trial from cloud:', e);
    }
  }

  async syncQcEntry(entry) {
    if (!this.isConnected || !this.db) return;
    try {
      await this.db.collection(this.COL_QC_LOG).doc(entry.id).set(entry, { merge: true });
    } catch (e) {
      console.error('Error syncing QC log to cloud:', e);
    }
  }

  async syncSearchLog(log) {
    if (!this.isConnected || !this.db) return;
    try {
      await this.db.collection(this.COL_SEARCH_LOGS).doc(log.id).set(log, { merge: true });
    } catch (e) {
      console.error('Error syncing search log to cloud:', e);
    }
  }

  async syncWeeklyProgress(row) {
    if (!this.isConnected || !this.db) return;
    try {
      await this.db.collection(this.COL_WEEKLY).doc(row.id).set(row, { merge: true });
    } catch (e) {
      console.error('Error syncing weekly progress to cloud:', e);
    }
  }

  async syncSearchMatrix(matrix) {
    if (!this.isConnected || !this.db) return;
    try {
      await this.db.collection(this.COL_META).doc('searchMatrix').set({
        matrix: matrix,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error('Error syncing search matrix to cloud:', e);
    }
  }

  async syncTasks(weeks, finalChecklist) {
    if (!this.isConnected || !this.db) return;
    try {
      await this.db.collection(this.COL_META).doc('tasks').set({
        weeks: weeks,
        finalChecklist: finalChecklist,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error('Error syncing tasks to cloud:', e);
    }
  }

  // Push all existing local trials to Firestore in one operation
  async pushAllLocalDataToCloud() {
    if (!this.isConnected || !this.db) {
      return { success: false, error: 'Cloud database is not connected.' };
    }

    try {
      this.updateStatusUI(true, 'Pushing Data...', true);
      const data = window.storage.getData();
      const batch = this.db.batch();

      // Trials
      (data.trials || []).forEach(t => {
        const ref = this.db.collection(this.COL_TRIALS).doc(t.id);
        batch.set(ref, t, { merge: true });
      });

      // QC Log
      (data.qcLog || []).forEach(q => {
        const ref = this.db.collection(this.COL_QC_LOG).doc(q.id);
        batch.set(ref, q, { merge: true });
      });

      // Search Logs
      (data.searchLogs || []).forEach(s => {
        const ref = this.db.collection(this.COL_SEARCH_LOGS).doc(s.id);
        batch.set(ref, s, { merge: true });
      });

      // Weekly Progress
      (data.weeklyProgress || []).forEach(w => {
        const ref = this.db.collection(this.COL_WEEKLY).doc(w.id);
        batch.set(ref, w, { merge: true });
      });

      // Tasks
      const metaRef = this.db.collection(this.COL_META).doc('tasks');
      batch.set(metaRef, {
        weeks: data.weeks || [],
        finalChecklist: data.finalChecklist || [],
        updatedAt: new Date().toISOString()
      }, { merge: true });

      await batch.commit();
      this.updateStatusUI(true, 'Cloud Synced');
      return { success: true, count: (data.trials || []).length };
    } catch (err) {
      console.error('Batch upload to cloud failed:', err);
      this.updateStatusUI(false, 'Upload Error');
      return { success: false, error: err.message };
    }
  }
}

// Global instance
window.cloudSync = new CloudSyncAdapter();
