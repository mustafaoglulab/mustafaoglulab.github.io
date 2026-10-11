/**
 * PROJ 201: Google Firebase Cloud Database Sync Adapter
 * Mustafaoglu Lab · Sabancı University · Fall 2026
 * 
 * Provides 100% free, real-time multi-user cloud synchronization for all 6 students
 * and supervisor across GitHub Pages static hosting using Google Firebase.
 * Supports both Firebase Realtime Database and Cloud Firestore.
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
    this.dbMode = 'rtdb'; // 'rtdb' or 'firestore'
    this.rtdb = null;
    this.firestore = null;
    this.isConnected = false;
    this.isSyncing = false;
    this.lastError = null;
    this.lastErrorCode = null;
    this.unsubscribes = [];

    this.init();
  }

  getConfig() {
    if (localStorage.getItem(this.DISABLED_KEY) === 'true') {
      return null;
    }

    try {
      const stored = localStorage.getItem(this.CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.apiKey) return parsed;
      }
    } catch (e) {
      console.error('Error parsing stored Firebase config:', e);
    }

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

      // Determine database mode: prefer Realtime Database if databaseURL or SDK available
      if (typeof firebase.database === 'function' && (config.databaseURL || config.projectId)) {
        this.dbMode = 'rtdb';
        this.rtdb = firebase.database();

        // Test connection with heartbeat document
        await this.rtdb.ref('proj201_meta/heartbeat').set({
          lastSeen: new Date().toISOString(),
          client: navigator.userAgent,
          status: 'Online'
        });

        this.isConnected = true;
        this.lastError = null;
        this.lastErrorCode = null;
        this.updateStatusUI(true, 'Cloud Synced');
        this.startRealtimeListeners();
        return { success: true };
      } else if (typeof firebase.firestore === 'function') {
        this.dbMode = 'firestore';
        this.firestore = firebase.firestore();

        await this.firestore.collection('proj201_meta').doc('heartbeat').set({
          lastSeen: new Date().toISOString(),
          client: navigator.userAgent
        }, { merge: true });

        this.isConnected = true;
        this.lastError = null;
        this.lastErrorCode = null;
        this.updateStatusUI(true, 'Cloud Synced');
        this.startRealtimeListeners();
        return { success: true };
      } else {
        throw new Error('Neither Firebase Realtime Database nor Firestore SDK is loaded.');
      }
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
    if (this.rtdb) {
      try {
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
    if (!this.isConnected) return;
    this.disconnect();
    this.isConnected = true;

    if (this.dbMode === 'rtdb' && this.rtdb) {
      // 1. Trials
      this.rtdb.ref('proj201_trials').on('value', snapshot => {
        const val = snapshot.val();
        if (val) {
          const cloudTrials = Object.values(val);
          if (cloudTrials.length > 0) {
            const currentData = window.storage.getData();
            currentData.trials = cloudTrials;
            localStorage.setItem(window.storage.STORAGE_KEY, JSON.stringify(currentData));
            window.storage.notifyUpdate();
          }
        }
      });

      // 2. Weekly Progress
      this.rtdb.ref('proj201_weekly_progress').on('value', snapshot => {
        const val = snapshot.val();
        if (val) {
          const currentData = window.storage.getData();
          currentData.weeklyProgress = Object.values(val);
          localStorage.setItem(window.storage.STORAGE_KEY, JSON.stringify(currentData));
          window.storage.notifyUpdate();
        }
      });

      // 3. Search Logs
      this.rtdb.ref('proj201_search_logs').on('value', snapshot => {
        const val = snapshot.val();
        if (val) {
          const currentData = window.storage.getData();
          currentData.searchLogs = Object.values(val);
          localStorage.setItem(window.storage.STORAGE_KEY, JSON.stringify(currentData));
          window.storage.notifyUpdate();
        }
      });

      // 4. Search Matrix
      this.rtdb.ref('proj201_meta/searchMatrix').on('value', snapshot => {
        const val = snapshot.val();
        if (val && val.matrix) {
          const currentData = window.storage.getData();
          currentData.searchMatrix = val.matrix;
          localStorage.setItem(window.storage.STORAGE_KEY, JSON.stringify(currentData));
          window.storage.notifyUpdate();
        }
      });
    } else if (this.dbMode === 'firestore' && this.firestore) {
      const unsubTrials = this.firestore.collection('proj201_trials').onSnapshot(snapshot => {
        const cloudTrials = [];
        snapshot.forEach(doc => cloudTrials.push(doc.data()));
        if (cloudTrials.length > 0) {
          const currentData = window.storage.getData();
          currentData.trials = cloudTrials;
          localStorage.setItem(window.storage.STORAGE_KEY, JSON.stringify(currentData));
          window.storage.notifyUpdate();
        }
      });
      this.unsubscribes.push(unsubTrials);
    }
  }

  // ==========================================
  // CLOUD WRITE DISPATCHERS
  // ==========================================
  async syncTrial(trial) {
    if (!this.isConnected) return;
    try {
      this.updateStatusUI(true, 'Syncing...', true);
      if (this.dbMode === 'rtdb' && this.rtdb) {
        await this.rtdb.ref(`proj201_trials/${trial.id}`).set(trial);
      } else if (this.firestore) {
        await this.firestore.collection('proj201_trials').doc(trial.id).set(trial, { merge: true });
      }
      this.updateStatusUI(true, 'Cloud Synced');
    } catch (e) {
      console.error('Error syncing trial to cloud:', e);
      this.updateStatusUI(false, 'Sync Failed');
    }
  }

  async deleteTrial(trialId) {
    if (!this.isConnected) return;
    try {
      this.updateStatusUI(true, 'Syncing...', true);
      if (this.dbMode === 'rtdb' && this.rtdb) {
        await this.rtdb.ref(`proj201_trials/${trialId}`).remove();
      } else if (this.firestore) {
        await this.firestore.collection('proj201_trials').doc(trialId).delete();
      }
      this.updateStatusUI(true, 'Cloud Synced');
    } catch (e) {
      console.error('Error deleting trial from cloud:', e);
    }
  }

  async syncWeeklyProgress(row) {
    if (!this.isConnected) return;
    try {
      if (this.dbMode === 'rtdb' && this.rtdb) {
        await this.rtdb.ref(`proj201_weekly_progress/${row.id}`).set(row);
      } else if (this.firestore) {
        await this.firestore.collection('proj201_weekly_progress').doc(row.id).set(row, { merge: true });
      }
    } catch (e) {
      console.error('Error syncing weekly progress to cloud:', e);
    }
  }

  async syncSearchLog(log) {
    if (!this.isConnected) return;
    try {
      if (this.dbMode === 'rtdb' && this.rtdb) {
        await this.rtdb.ref(`proj201_search_logs/${log.id}`).set(log);
      } else if (this.firestore) {
        await this.firestore.collection('proj201_search_logs').doc(log.id).set(log, { merge: true });
      }
    } catch (e) {
      console.error('Error syncing search log to cloud:', e);
    }
  }

  async syncSearchMatrix(matrix) {
    if (!this.isConnected) return;
    try {
      if (this.dbMode === 'rtdb' && this.rtdb) {
        await this.rtdb.ref('proj201_meta/searchMatrix').set({
          matrix: matrix,
          updatedAt: new Date().toISOString()
        });
      } else if (this.firestore) {
        await this.firestore.collection('proj201_meta').doc('searchMatrix').set({
          matrix: matrix,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (e) {
      console.error('Error syncing search matrix to cloud:', e);
    }
  }

  async pushAllLocalDataToCloud() {
    if (!this.isConnected) {
      return { success: false, error: 'Cloud database is not connected.' };
    }

    try {
      this.updateStatusUI(true, 'Pushing Data...', true);
      const data = window.storage.getData();

      if (this.dbMode === 'rtdb' && this.rtdb) {
        const updates = {};
        (data.trials || []).forEach(t => {
          updates[`proj201_trials/${t.id}`] = t;
        });
        (data.weeklyProgress || []).forEach(w => {
          updates[`proj201_weekly_progress/${w.id}`] = w;
        });
        (data.searchLogs || []).forEach(s => {
          updates[`proj201_search_logs/${s.id}`] = s;
        });
        updates['proj201_meta/searchMatrix'] = {
          matrix: data.searchMatrix || [],
          updatedAt: new Date().toISOString()
        };

        await this.rtdb.ref().update(updates);
        this.updateStatusUI(true, 'Cloud Synced');
        return { success: true, count: (data.trials || []).length };
      } else if (this.firestore) {
        const batch = this.firestore.batch();
        (data.trials || []).forEach(t => {
          const ref = this.firestore.collection('proj201_trials').doc(t.id);
          batch.set(ref, t, { merge: true });
        });
        await batch.commit();
        this.updateStatusUI(true, 'Cloud Synced');
        return { success: true, count: (data.trials || []).length };
      }
    } catch (err) {
      console.error('Batch upload to cloud failed:', err);
      return { success: false, error: err.message };
    }
  }
}

// Global instance
window.cloudSync = new CloudSyncAdapter();
