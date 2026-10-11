/**
 * PROJ 201: Search Log Controller (02_SEARCH_LOG)
 * Automatically derives the 7-Step Cumulative Filter Funnel from student search queries.
 * Mustafaoglu Lab · Sabancı University · Fall 2026
 */

class SearchLogController {
  constructor() {
    this.matrixBody = document.getElementById('searchMatrixBody');
    this.listBody = document.getElementById('searchLogListBody');
    this.modalBackdrop = document.getElementById('searchLogModalBackdrop');
    this.form = document.getElementById('searchEntryForm');
    this.stepSelect = document.getElementById('slStep');

    this.initEventListeners();
  }

  initEventListeners() {
    // Open Modal button
    const btnOpen = document.getElementById('btnOpenSearchLogModal');
    if (btnOpen) {
      btnOpen.addEventListener('click', () => this.openModal());
    }

    // Modal close buttons
    const btnClose = document.getElementById('btnCloseSearchModal');
    const btnCancel = document.getElementById('btnCancelSearchModal');
    if (btnClose) btnClose.addEventListener('click', () => this.closeModal());
    if (btnCancel) btnCancel.addEventListener('click', () => this.closeModal());

    // Step change helper: pre-fill suggested filters when step changes
    if (this.stepSelect) {
      this.stepSelect.addEventListener('change', () => this.onStepChanged());
    }

    // Form submit
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveEntry();
      });
    }

    // React to data changes across app or cloud sync
    window.addEventListener('proj201:datachange', () => {
      this.render();
    });
  }

  render() {
    this.renderMatrix();
    this.renderLogs();
  }

  // ==========================================
  // 1. AUTOMATICALLY DERIVED CUMULATIVE FUNNEL
  // ==========================================
  renderMatrix() {
    if (!this.matrixBody) return;
    const logs = (window.storage && window.storage.getSearchLogs()) || [];

    const steps = typeof SEARCH_STEPS_DEF !== 'undefined' ? SEARCH_STEPS_DEF : [
      { stepNumber: 1, stepName: "All registered trials", defaultAd: 4309, defaultGbm: 2273, defaultStroke: 11262 },
      { stepNumber: 2, stepName: "Interventional studies", defaultAd: 3402, defaultGbm: 2024, defaultStroke: 8266 },
      { stepNumber: 3, stepName: "Early Phase 1, Phase 1, Phase 2, Phase 3, Phase 4", defaultAd: 1809, defaultGbm: 1765, defaultStroke: 2270 },
      { stepNumber: 4, stepName: "Completed, Terminated, Withdrawn", defaultAd: 1352, defaultGbm: 1166, defaultStroke: 1413 },
      { stepNumber: 5, stepName: "Drug / Biological", defaultAd: 1239, defaultGbm: 1094, defaultStroke: 1001 },
      { stepNumber: 6, stepName: "Completion 2000–2026", defaultAd: 1183, defaultGbm: 1006, defaultStroke: 962 },
      { stepNumber: 7, stepName: "Outcomes / Reasons Available", defaultAd: 469, defaultGbm: 354, defaultStroke: 266 }
    ];

    this.matrixBody.innerHTML = steps.map(stepDef => {
      const isFinal = (stepDef.stepNumber === 7);

      // Match the most recent student search log for each disease & step
      const adLog = logs.find(l => parseInt(l.stepNumber, 10) === stepDef.stepNumber && l.disease === "Alzheimer's");
      const gbmLog = logs.find(l => parseInt(l.stepNumber, 10) === stepDef.stepNumber && l.disease === "GBM");
      const strokeLog = logs.find(l => parseInt(l.stepNumber, 10) === stepDef.stepNumber && l.disease === "Stroke");

      const adCount = adLog ? adLog.resultsCount : stepDef.defaultAd;
      const gbmCount = gbmLog ? gbmLog.resultsCount : stepDef.defaultGbm;
      const strokeCount = strokeLog ? strokeLog.resultsCount : stepDef.defaultStroke;

      const adBadge = adLog 
        ? `<span class="badge-source" title="Derived from student search log (${adLog.date})">Logged</span>` 
        : `<span class="badge-ref" title="Initial reference baseline">Ref</span>`;

      const gbmBadge = gbmLog 
        ? `<span class="badge-source" title="Derived from student search log (${gbmLog.date})">Logged</span>` 
        : `<span class="badge-ref" title="Initial reference baseline">Ref</span>`;

      const strokeBadge = strokeLog 
        ? `<span class="badge-source" title="Derived from student search log (${strokeLog.date})">Logged</span>` 
        : `<span class="badge-ref" title="Initial reference baseline">Ref</span>`;

      const highlightClass = isFinal ? 'font-bold text-primary' : '';

      return `
        <tr class="${isFinal ? 'bg-subtle font-bold' : ''}">
          <td class="font-mono text-xs text-center">
            <span class="badge ${isFinal ? 'badge-primary' : 'badge-secondary'}">${stepDef.stepNumber}</span>
          </td>
          <td>
            <strong>${stepDef.stepName}</strong>
            ${isFinal ? '<div class="text-xs text-muted">Final study cohort with posted results or documented termination reasons</div>' : ''}
          </td>
          <td class="text-right font-mono ${highlightClass}">
            <div class="d-flex align-center justify-end gap-1">
              <span>${(adCount || 0).toLocaleString()}</span>
              ${adBadge}
            </div>
          </td>
          <td class="text-right font-mono ${highlightClass}">
            <div class="d-flex align-center justify-end gap-1">
              <span>${(gbmCount || 0).toLocaleString()}</span>
              ${gbmBadge}
            </div>
          </td>
          <td class="text-right font-mono ${highlightClass}">
            <div class="d-flex align-center justify-end gap-1">
              <span>${(strokeCount || 0).toLocaleString()}</span>
              ${strokeBadge}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ==========================================
  // 2. DETAILED SEARCH LOG ENTRIES LIST
  // ==========================================
  renderLogs() {
    if (!this.listBody) return;
    const logs = (window.storage && window.storage.getSearchLogs()) || [];

    if (logs.length === 0) {
      this.listBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted p-3">No search queries logged yet. Click "Record Search Query" to log one.</td></tr>`;
      return;
    }

    this.listBody.innerHTML = logs.map(l => {
      const disClass = l.disease === "Alzheimer's" ? 'pill-ad' :
                       l.disease === "GBM" ? 'pill-gbm' : 'pill-stroke';

      const stepNum = l.stepNumber || 7;

      return `
        <tr>
          <td class="font-mono text-xs text-muted" style="white-space: nowrap;">${l.date || ''}</td>
          <td><span class="pill ${disClass}">${l.disease || 'All'}</span></td>
          <td><span class="badge badge-secondary font-mono text-xs">Step ${stepNum}</span></td>
          <td>
            <div class="text-sm font-bold font-mono text-main">${this.escapeHtml(l.searchTerms || '')}</div>
            <div class="text-xs text-muted mt-1">Filters: ${this.escapeHtml(l.filtersApplied || 'Standard filters')}</div>
            ${l.notes ? `<div class="text-xs text-muted mt-1" style="font-style: italic;">Note: ${this.escapeHtml(l.notes)}</div>` : ''}
          </td>
          <td class="text-right font-mono font-bold">${(l.resultsCount || 0).toLocaleString()}</td>
          <td><span class="text-xs text-muted">${l.student || l.loggedBy || 'Student'}</span></td>
          <td class="text-right" style="white-space: nowrap;">
            <div class="d-flex justify-end gap-1">
              ${l.sourceUrl ? `
                <a href="${l.sourceUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm font-mono text-xs" title="Open ClinicalTrials.gov query">
                  View &nearr;
                </a>
              ` : ''}
              <button type="button" class="btn btn-outline btn-sm text-danger" onclick="window.searchLog.deleteEntry('${l.id}')" title="Delete log entry" style="padding: 0.2rem 0.45rem;">
                &times;
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  deleteEntry(id) {
    if (confirm('Are you sure you want to delete this recorded search query? The funnel table counts will update automatically.')) {
      window.storage.deleteSearchLog(id);
      if (window.app && window.app.showToast) {
        window.app.showToast('Search query deleted.', 'info');
      }
    }
  }

  // ==========================================
  // 3. RECORD SEARCH STEP MODAL
  // ==========================================
  openModal() {
    if (!this.modalBackdrop) return;
    if (this.form) this.form.reset();

    const dateInput = document.getElementById('slDate');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    const activeProfile = window.storage.getActiveUserProfile();
    const diseaseSelect = document.getElementById('slDisease');
    if (diseaseSelect && activeProfile.diseaseScope && activeProfile.diseaseScope !== 'ALL') {
      diseaseSelect.value = activeProfile.diseaseScope;
    }

    if (this.stepSelect) {
      this.stepSelect.value = "7";
      this.onStepChanged();
    }

    this.modalBackdrop.classList.remove('d-none');
  }

  closeModal() {
    if (this.modalBackdrop) this.modalBackdrop.classList.add('d-none');
  }

  onStepChanged() {
    const stepNum = parseInt(this.stepSelect.value, 10);
    const filterInput = document.getElementById('slFilters');
    const termsInput = document.getElementById('slTerms');
    const diseaseSelect = document.getElementById('slDisease');
    const dis = diseaseSelect ? diseaseSelect.value : "Alzheimer's";

    const conditionMap = {
      "Alzheimer's": '"Alzheimer Disease" [Condition]',
      "GBM": '"Glioblastoma" OR "GBM" [Condition]',
      "Stroke": '"Stroke" OR "Acute Ischemic Stroke" [Condition]'
    };

    if (termsInput && !termsInput.value) {
      termsInput.value = conditionMap[dis] || 'Condition Search';
    }

    if (filterInput) {
      const stepFilterDefaults = {
        1: "All registered trials (condition search on ClinicalTrials.gov)",
        2: "Study Type: Interventional",
        3: "Study Type: Interventional | Phase: Early Phase 1, Phase 1, Phase 2, Phase 3, Phase 4",
        4: "Study Type: Interventional | Phases 1–4 | Status: Completed, Terminated, Withdrawn",
        5: "Study Type: Interventional | Phases 1–4 | Status: Completed, Terminated, Withdrawn | Intervention: Drug, Biological",
        6: "Study Type: Interventional | Phases 1–4 | Completed, Terminated, Withdrawn | Drug, Biological | Completion: 2000–2026",
        7: "Interventional | Phases 1–4 | Completed, Terminated, Withdrawn | Drug, Biological | 2000–2026 | Outcomes / Reasons Available"
      };
      filterInput.value = stepFilterDefaults[stepNum] || "";
    }
  }

  saveEntry() {
    const activeProfile = window.storage.getActiveUserProfile();
    const stepNum = parseInt(document.getElementById('slStep').value, 10) || 7;
    const stepDef = typeof SEARCH_STEPS_DEF !== 'undefined' 
      ? SEARCH_STEPS_DEF.find(s => s.stepNumber === stepNum) 
      : null;

    const entry = {
      id: 'search-' + Date.now(),
      stepNumber: stepNum,
      stepName: stepDef ? stepDef.stepName : `Step ${stepNum}`,
      date: document.getElementById('slDate').value,
      disease: document.getElementById('slDisease').value,
      searchTerms: document.getElementById('slTerms').value.trim(),
      filtersApplied: document.getElementById('slFilters').value.trim(),
      resultsCount: parseInt(document.getElementById('slCount').value, 10) || 0,
      sourceUrl: document.getElementById('slUrl').value.trim(),
      notes: document.getElementById('slNotes').value.trim(),
      student: activeProfile.name
    };

    window.storage.addSearchLog(entry);
    this.closeModal();

    if (window.app && window.app.showToast) {
      window.app.showToast(`Search query logged for Step ${stepNum} (${entry.disease}): ${entry.resultsCount.toLocaleString()} trials!`, 'success');
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

// Global instance
window.searchLog = new SearchLogController();
