/**
 * PROJ 201: Search Log Controller (02_SEARCH_LOG)
 * Manages the 7-Step Cumulative Filter Matrix & Search Query Log
 * Mustafaoglu Lab · Sabancı University · Fall 2026
 */

class SearchLogController {
  constructor() {
    this.matrixBody = document.getElementById('searchMatrixBody');
    this.listBody = document.getElementById('searchLogListBody');
    this.modalBackdrop = document.getElementById('searchLogModalBackdrop');
    this.form = document.getElementById('searchEntryForm');

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

    // Form submit
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveEntry();
      });
    }

    // React to data changes
    window.addEventListener('proj201:datachange', () => {
      this.render();
    });
  }

  render() {
    this.renderMatrix();
    this.renderLogs();
  }

  renderMatrix() {
    if (!this.matrixBody) return;
    const matrix = window.storage.getSearchMatrix();

    if (!matrix || matrix.length === 0) {
      this.matrixBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted p-3">No search matrix data found.</td></tr>`;
      return;
    }

    this.matrixBody.innerHTML = matrix.map((step, idx) => {
      const isFinal = (step.stepNumber === 7);
      const highlightClass = isFinal ? 'font-bold text-primary' : '';

      return `
        <tr class="${isFinal ? 'bg-subtle font-bold' : ''}">
          <td class="font-mono text-xs text-center"><span class="badge badge-secondary">${step.stepNumber}</span></td>
          <td>
            <strong>${step.stepName}</strong>
            ${isFinal ? '<div class="text-xs text-muted">Final pool with published results or documented outcome reasons</div>' : ''}
          </td>
          <td class="text-right font-mono ${highlightClass}">
            <span class="count-val" onclick="window.searchLog.editStepCount(${idx}, 'adCount')" title="Click to edit count" style="cursor: pointer; text-decoration: underline dotted;">
              ${(step.adCount || 0).toLocaleString()}
            </span>
          </td>
          <td class="text-right font-mono ${highlightClass}">
            <span class="count-val" onclick="window.searchLog.editStepCount(${idx}, 'gbmCount')" title="Click to edit count" style="cursor: pointer; text-decoration: underline dotted;">
              ${(step.gbmCount || 0).toLocaleString()}
            </span>
          </td>
          <td class="text-right font-mono ${highlightClass}">
            <span class="count-val" onclick="window.searchLog.editStepCount(${idx}, 'strokeCount')" title="Click to edit count" style="cursor: pointer; text-decoration: underline dotted;">
              ${(step.strokeCount || 0).toLocaleString()}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  editStepCount(stepIndex, diseaseField) {
    const matrix = window.storage.getSearchMatrix();
    const step = matrix[stepIndex];
    if (!step) return;

    const disName = diseaseField === 'adCount' ? "Alzheimer's" : diseaseField === 'gbmCount' ? "GBM" : "Stroke";
    const current = step[diseaseField] || 0;
    const val = prompt(`Update Step ${step.stepNumber} count for ${disName} (${step.stepName}):`, current);

    if (val !== null) {
      const parsed = parseInt(val.replace(/,/g, ''), 10);
      if (!isNaN(parsed) && parsed >= 0) {
        step[diseaseField] = parsed;
        window.storage.updateSearchMatrix(matrix);
        if (window.app && window.app.showToast) {
          window.app.showToast(`Updated Step ${step.stepNumber} ${disName} count to ${parsed.toLocaleString()}`, 'success');
        }
      }
    }
  }

  renderLogs() {
    if (!this.listBody) return;
    const logs = window.storage.getSearchLogs();

    if (logs.length === 0) {
      this.listBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted p-3">No search queries logged yet. Click "Record Search Query" to add one.</td></tr>`;
      return;
    }

    this.listBody.innerHTML = logs.map(l => {
      const disClass = l.disease === "Alzheimer's" ? 'pill-ad' :
                       l.disease === "GBM" ? 'pill-gbm' : 'pill-stroke';

      return `
        <tr>
          <td class="font-mono text-xs text-muted" style="white-space: nowrap;">${l.date || ''}</td>
          <td><span class="pill ${disClass}">${l.disease || 'All'}</span></td>
          <td>
            <div class="text-sm font-bold font-mono text-main">${this.escapeHtml(l.searchTerms || '')}</div>
            <div class="text-xs text-muted mt-1">Filters: ${this.escapeHtml(l.filtersApplied || 'Standard filters')}</div>
            ${l.notes ? `<div class="text-xs text-muted mt-1" style="font-style: italic;">Note: ${this.escapeHtml(l.notes)}</div>` : ''}
          </td>
          <td class="text-right font-mono font-bold">${(l.resultsCount || 0).toLocaleString()}</td>
          <td><span class="text-xs text-muted">${l.student || l.loggedBy || 'Student'}</span></td>
          <td class="text-right">
            ${l.sourceUrl ? `
              <a href="${l.sourceUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm font-mono text-xs" title="Open ClinicalTrials.gov query">
                View &nearr;
              </a>
            ` : '—'}
          </td>
        </tr>
      `;
    }).join('');
  }

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

    this.modalBackdrop.classList.remove('d-none');
  }

  closeModal() {
    if (this.modalBackdrop) this.modalBackdrop.classList.add('d-none');
  }

  saveEntry() {
    const activeProfile = window.storage.getActiveUserProfile();

    const entry = {
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
      window.app.showToast(`Search query logged for ${entry.disease} (${entry.resultsCount} trials)!`, 'success');
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
