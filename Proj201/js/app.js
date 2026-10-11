/**
 * PROJ 201: Main Application Core, Navigation Router & Modal Handlers
 * Mustafaoglu Lab · Sabancı University · Fall 2026
 */

class AppController {
  constructor() {
    this.activeTab = 'tab-instructions';
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.initNavigation();
      this.initUserProfile();
      this.initDataToolsDropdown();
      this.initImportModal();
      this.initCloudModal();

      // Trigger initial renders
      window.storage.notifyUpdate();
      if (window.trialTable) window.trialTable.render();
      if (window.searchLog) window.searchLog.render();
      if (window.weeklyTracker) window.weeklyTracker.render();
      if (window.analytics) window.analytics.render();
    });
  }

  // ==========================================
  // NAVIGATION ROUTER (9 Course Workspace Tabs)
  // ==========================================
  initNavigation() {
    const tabButtons = document.querySelectorAll('.app-tabs-nav .tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        this.navigateToTab(targetTab);
      });
    });
  }

  navigateToTab(tabId) {
    if (!tabId) return;
    this.activeTab = tabId;

    // Update navigation buttons
    const tabButtons = document.querySelectorAll('.app-tabs-nav .tab-btn');
    tabButtons.forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    // Update tab panels
    const panels = document.querySelectorAll('.tab-panel');
    panels.forEach(p => {
      if (p.id === tabId) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Component refresh on tab switch
    if (tabId === 'tab-analysis' && window.analytics) {
      setTimeout(() => window.analytics.render(), 100);
    } else if (tabId === 'tab-searchlog' && window.searchLog) {
      setTimeout(() => window.searchLog.render(), 50);
    } else if (tabId === 'tab-weekly' && window.weeklyTracker) {
      setTimeout(() => window.weeklyTracker.render(), 50);
    } else if (
      (tabId === 'tab-alzheimers' || tabId === 'tab-gbm' || tabId === 'tab-stroke' || tabId === 'tab-combined') &&
      window.trialTable
    ) {
      setTimeout(() => window.trialTable.render(), 50);
    }
  }

  // ==========================================
  // ACTIVE USER PROFILE
  // ==========================================
  initUserProfile() {
    const select = document.getElementById('activeUserSelect');
    if (!select) return;

    const currentUserId = window.storage.getActiveUser();
    select.value = currentUserId;

    select.addEventListener('change', (e) => {
      const newUserId = e.target.value;
      window.storage.setActiveUser(newUserId);

      const profile = window.storage.getActiveUserProfile();
      this.showToast(`Switched active profile to ${profile.name} (${profile.group})`, 'info');

      // Notify other components
      window.storage.notifyUpdate();
    });
  }

  // ==========================================
  // DATA TOOLS & DROPDOWN
  // ==========================================
  initDataToolsDropdown() {
    const btnToggle = document.getElementById('btnDataActions');
    const dropdown = document.getElementById('dataActionsDropdown');
    const btnExportCsv = document.getElementById('btnExportCSV');
    const btnExportJson = document.getElementById('btnExportJSON');
    const btnOpenCloud = document.getElementById('btnOpenCloudConfig');
    const btnOpenImport = document.getElementById('btnOpenImportModal');
    const btnReset = document.getElementById('btnResetToDefaults');
    const btnNewTrial = document.getElementById('btnNewTrial');

    if (btnNewTrial) {
      btnNewTrial.addEventListener('click', () => {
        window.trialForm.openNewModal();
      });
    }

    if (btnToggle && dropdown) {
      btnToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        dropdown.classList.remove('show');
      });
    }

    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', () => {
        // Export matching active tab context
        let dis = 'ALL';
        if (this.activeTab === 'tab-alzheimers') dis = "Alzheimer's";
        else if (this.activeTab === 'tab-gbm') dis = "GBM";
        else if (this.activeTab === 'tab-stroke') dis = "Stroke";

        window.storage.exportAsCSV(dis);
        this.showToast(`Exported ${dis === 'ALL' ? 'Combined Database' : dis} as CSV.`, 'success');
      });
    }

    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => {
        window.storage.exportAsJSON();
        this.showToast('Full dataset backup exported as JSON file.', 'success');
      });
    }

    if (btnOpenCloud) {
      btnOpenCloud.addEventListener('click', () => {
        this.openCloudModal();
      });
    }

    if (btnOpenImport) {
      btnOpenImport.addEventListener('click', () => {
        this.openImportModal();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Are you sure you want to reload the initial benchmark seed dataset? Any unsaved local edits will be reset.')) {
          window.storage.resetToSeedData();
          this.showToast('Database reset to official benchmark dataset.', 'info');
        }
      });
    }
  }

  // ==========================================
  // DATA IMPORT BACKUP MODAL
  // ==========================================
  initImportModal() {
    const modal = document.getElementById('importModalBackdrop');
    const btnClose = document.getElementById('btnCloseImportModal');
    const btnCancel = document.getElementById('btnCancelImportModal');
    const btnExecute = document.getElementById('btnExecuteImport');
    const fileInput = document.getElementById('importFileInput');
    const textArea = document.getElementById('importJsonTextarea');

    if (btnClose) btnClose.addEventListener('click', () => this.closeImportModal());
    if (btnCancel) btnCancel.addEventListener('click', () => this.closeImportModal());

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          if (textArea) textArea.value = event.target.result;
        };
        reader.readAsText(file);
      });
    }

    if (btnExecute) {
      btnExecute.addEventListener('click', () => {
        const content = textArea.value.trim();
        if (!content) {
          alert('Please select a file or paste JSON content.');
          return;
        }

        try {
          const parsed = JSON.parse(content);
          const modeEl = document.querySelector('input[name="importMode"]:checked');
          const mode = modeEl ? modeEl.value : 'merge';

          if (mode === 'replace') {
            window.storage.saveData(parsed);
          } else {
            const current = window.storage.getData();
            if (Array.isArray(parsed.trials)) {
              parsed.trials.forEach(trial => {
                const idx = current.trials.findIndex(t => t.id === trial.id || (t.nctId && t.nctId.toUpperCase() === trial.nctId.toUpperCase()));
                if (idx >= 0) current.trials[idx] = { ...current.trials[idx], ...trial };
                else current.trials.push(trial);
              });
            }
            if (Array.isArray(parsed.weeklyProgress)) {
              current.weeklyProgress = [...parsed.weeklyProgress, ...(current.weeklyProgress || [])];
            }
            if (Array.isArray(parsed.searchLogs)) {
              current.searchLogs = [...parsed.searchLogs, ...(current.searchLogs || [])];
            }
            window.storage.saveData(current);
          }

          this.closeImportModal();
          this.showToast('Data backup imported successfully!', 'success');
        } catch (err) {
          alert('Error parsing JSON backup file: ' + err.message);
        }
      });
    }
  }

  openImportModal() {
    const modal = document.getElementById('importModalBackdrop');
    if (modal) modal.classList.remove('d-none');
  }

  closeImportModal() {
    const modal = document.getElementById('importModalBackdrop');
    if (modal) modal.classList.add('d-none');
  }

  // ==========================================
  // FIREBASE CLOUD DATABASE MODAL
  // ==========================================
  initCloudModal() {
    const btnStatus = document.getElementById('btnCloudStatus');
    const modal = document.getElementById('cloudSettingsModalBackdrop');
    const btnClose = document.getElementById('btnCloseCloudModal');
    const btnCancel = document.getElementById('btnCancelCloudModal');
    const btnSave = document.getElementById('btnSaveCloudConfig');
    const btnDisconnect = document.getElementById('btnDisconnectCloud');
    const btnPush = document.getElementById('btnPushLocalToCloud');

    if (btnStatus) {
      btnStatus.addEventListener('click', () => this.openCloudModal());
    }

    if (btnClose) btnClose.addEventListener('click', () => this.closeCloudModal());
    if (btnCancel) btnCancel.addEventListener('click', () => this.closeCloudModal());

    if (btnSave) {
      btnSave.addEventListener('click', async () => {
        const raw = document.getElementById('firebaseConfigInput').value.trim();
        if (!raw) {
          alert('Please paste your Firebase configuration.');
          return;
        }

        try {
          let config = null;
          if (raw.startsWith('{')) {
            config = JSON.parse(raw);
          } else {
            const match = raw.match(/\{[\s\S]*\}/);
            if (match) {
              const cleaned = match[0].replace(/([a-zA-Z0-9_]+):/g, '"$1":').replace(/'/g, '"');
              config = JSON.parse(cleaned);
            }
          }

          if (!config || !config.apiKey || !config.projectId) {
            throw new Error('Config missing apiKey or projectId');
          }

          btnSave.disabled = true;
          btnSave.textContent = 'Connecting...';

          const res = await window.cloudSync.saveConfig(config);
          btnSave.disabled = false;
          btnSave.textContent = 'Test & Connect';

          if (res.success) {
            this.showToast('Connected to Firebase Firestore Cloud Database!', 'success');
            this.closeCloudModal();
          } else {
            alert('Firebase Connection failed: ' + res.error);
          }
        } catch (err) {
          btnSave.disabled = false;
          btnSave.textContent = 'Test & Connect';
          alert('Could not parse Firebase config: ' + err.message);
        }
      });
    }

    if (btnDisconnect) {
      btnDisconnect.addEventListener('click', () => {
        if (confirm('Disconnect from Firebase cloud database and revert to local storage?')) {
          window.cloudSync.clearConfig();
          this.showToast('Disconnected from cloud sync.', 'info');
        }
      });
    }

    if (btnPush) {
      btnPush.addEventListener('click', async () => {
        btnPush.disabled = true;
        btnPush.textContent = 'Pushing Data...';
        const res = await window.cloudSync.pushAllLocalDataToCloud();
        btnPush.disabled = false;
        btnPush.textContent = 'Upload Current Local Trials to Cloud';

        if (res.success) {
          this.showToast(`Pushed ${res.count} clinical trials to cloud database!`, 'success');
        } else {
          alert('Upload failed: ' + res.error);
        }
      });
    }
  }

  openCloudModal() {
    const modal = document.getElementById('cloudSettingsModalBackdrop');
    if (!modal) return;

    const modalDot = document.getElementById('modalCloudDot');
    const modalStatusText = document.getElementById('modalCloudStatusText');
    const modalSubText = document.getElementById('modalCloudSubText');
    const btnDisconnect = document.getElementById('btnDisconnectCloud');
    const configInput = document.getElementById('firebaseConfigInput');

    if (window.cloudSync && window.cloudSync.isConnected) {
      modalDot.className = 'status-dot-lg connected';
      modalStatusText.textContent = 'Connected & Synced';
      modalSubText.textContent = 'Real-time multi-user live synchronization is active.';
      if (btnDisconnect) btnDisconnect.classList.remove('d-none');
    } else {
      modalDot.className = 'status-dot-lg';
      modalStatusText.textContent = 'Operating in Offline / Local Mode';
      modalSubText.textContent = 'Data is safely preserved in browser localStorage.';
      if (btnDisconnect) btnDisconnect.classList.add('d-none');
    }

    const currentConfig = window.cloudSync ? window.cloudSync.getConfig() : null;
    if (currentConfig && configInput && !configInput.value) {
      configInput.value = JSON.stringify(currentConfig, null, 2);
    }

    modal.classList.remove('d-none');
  }

  closeCloudModal() {
    const modal = document.getElementById('cloudSettingsModalBackdrop');
    if (modal) modal.classList.add('d-none');
  }

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-body">
        <span>${message}</span>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3500);
  }
}

// Global instance
window.app = new AppController();
