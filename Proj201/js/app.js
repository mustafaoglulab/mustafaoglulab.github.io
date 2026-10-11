/**
 * PROJ 201: Main Application Core & Navigation Router
 * Mustafaoglu Lab · Sabancı University · Fall 2026
 */

class AppController {
  constructor() {
    this.activeTab = 'tab-dashboard';
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.initNavigation();
      this.initUserProfile();
      this.initDataToolsDropdown();
      this.initImportModal();
      this.initGlobalEvents();

      // Trigger initial renders
      window.storage.notifyUpdate();
      this.updateUserGreeting();
    });
  }

  initNavigation() {
    const tabButtons = document.querySelectorAll('.app-nav .tab-link');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetTab = btn.dataset.tab;
        this.navigateToTab(targetTab);
      });
    });
  }

  navigateToTab(tabId) {
    this.activeTab = tabId;

    // Update nav links
    const tabButtons = document.querySelectorAll('.app-nav .tab-link');
    tabButtons.forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    // Update panes
    const panes = document.querySelectorAll('.tab-pane');
    panes.forEach(pane => {
      if (pane.id === tabId) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Re-render charts if analytics or searchlog tab
    if (tabId === 'tab-analytics' && window.analytics) {
      setTimeout(() => window.analytics.render(), 100);
    }
    if (tabId === 'tab-searchlog' && window.searchLog) {
      setTimeout(() => window.searchLog.renderFunnelChart(), 100);
    }
  }

  initUserProfile() {
    const select = document.getElementById('activeUserSelect');
    if (!select) return;

    // Load saved user
    const currentUserId = window.storage.getActiveUser();
    select.value = currentUserId;

    select.addEventListener('change', (e) => {
      const newUserId = e.target.value;
      window.storage.setActiveUser(newUserId);
      this.updateUserGreeting();

      const profile = window.storage.getActiveUserProfile();
      this.showToast(`Switched active profile to ${profile.name} (${profile.group})`, 'info');

      // Dispatch change so forms and lists update
      window.storage.notifyUpdate();
    });
  }

  updateUserGreeting() {
    const profile = window.storage.getActiveUserProfile();
    const greetingName = document.getElementById('greetingUserName');
    if (greetingName) {
      greetingName.textContent = `${profile.name} (${profile.group})`;
    }
  }

  initDataToolsDropdown() {
    const btnToggle = document.getElementById('btnDataActions');
    const dropdown = document.getElementById('dataActionsDropdown');
    const btnExportJson = document.getElementById('btnExportJSON');
    const btnExportCsv = document.getElementById('btnExportCSV');
    const btnOpenImport = document.getElementById('btnOpenImportModal');
    const btnReset = document.getElementById('btnResetToDefaults');
    const btnNewTrialHeader = document.getElementById('btnNewTrial');

    if (btnNewTrialHeader) {
      btnNewTrialHeader.addEventListener('click', () => {
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

    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => {
        window.storage.exportAsJSON();
        this.showToast('Full dataset exported as JSON file.', 'success');
      });
    }

    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', () => {
        const activeDisease = window.trialTable ? window.trialTable.currentDiseaseFilter : 'ALL';
        window.storage.exportAsCSV(activeDisease);
        this.showToast(`Exported ${activeDisease === 'ALL' ? 'Combined Database' : activeDisease} as CSV.`, 'success');
      });
    }

    if (btnOpenImport) {
      btnOpenImport.addEventListener('click', () => {
        this.openImportModal();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        const confirmed = confirm('Are you sure you want to reload the default benchmark seed dataset? Any unexported local changes will be replaced with initial course examples.');
        if (confirmed) {
          window.storage.resetToSeedData();
          this.showToast('Benchmark seed dataset reloaded successfully!', 'info');
        }
      });
    }
  }

  initImportModal() {
    const modalBackdrop = document.getElementById('importModalBackdrop');
    const btnClose = document.getElementById('btnCloseImportModal');
    const btnCancel = document.getElementById('btnCancelImportModal');
    const btnExecute = document.getElementById('btnExecuteImport');
    const fileInput = document.getElementById('importFileInput');
    const textarea = document.getElementById('importJsonTextarea');

    if (btnClose) btnClose.addEventListener('click', () => this.closeImportModal());
    if (btnCancel) btnCancel.addEventListener('click', () => this.closeImportModal());

    // File input change
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          if (textarea) textarea.value = event.target.result;
        };
        reader.readAsText(file);
      });
    }

    if (btnExecute) {
      btnExecute.addEventListener('click', () => {
        const jsonContent = textarea ? textarea.value.trim() : '';
        if (!jsonContent) {
          alert('Please upload a JSON file or paste JSON content.');
          return;
        }

        const modeRadio = document.querySelector('input[name="importMode"]:checked');
        const mode = modeRadio ? modeRadio.value : 'merge';

        const result = window.storage.importFromJSON(jsonContent, mode);
        if (result.success) {
          this.closeImportModal();
          if (result.mode === 'replaced') {
            this.showToast(`Database replaced with ${result.count} trials.`, 'success');
          } else {
            this.showToast(`Import completed: ${result.added} added, ${result.updated} updated.`, 'success');
          }
        } else {
          alert('Import error: ' + result.error);
        }
      });
    }
  }

  openImportModal() {
    const modalBackdrop = document.getElementById('importModalBackdrop');
    const textarea = document.getElementById('importJsonTextarea');
    const fileInput = document.getElementById('importFileInput');
    if (textarea) textarea.value = '';
    if (fileInput) fileInput.value = '';
    if (modalBackdrop) modalBackdrop.classList.remove('d-none');
  }

  closeImportModal() {
    const modalBackdrop = document.getElementById('importModalBackdrop');
    if (modalBackdrop) modalBackdrop.classList.add('d-none');
  }

  initGlobalEvents() {
    // ESC key closes modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal-backdrop:not(.d-none)');
        openModals.forEach(m => m.classList.add('d-none'));
      }
    });
  }

  // Toast notification helper
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `
      ${iconSvg}
      <div style="flex: 1;">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3800);
  }
}

// Global application singleton
window.app = new AppController();
