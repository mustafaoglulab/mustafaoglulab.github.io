/**
 * PROJ 201: Clinical Trial Landscape & Search Log Controller
 * Mustafaoglu Lab · Sabancı University · Fall 2026
 */

class SearchLogController {
  constructor() {
    this.tableBody = document.getElementById('searchLogTableBody');
    this.modalBackdrop = document.getElementById('searchLogModalBackdrop');
    this.form = document.getElementById('searchLogForm');
    this.chartInstance = null;

    this.initEventListeners();
  }

  initEventListeners() {
    const btnOpen = document.getElementById('btnAddSearchLog');
    if (btnOpen) {
      btnOpen.addEventListener('click', () => this.openModal());
    }

    const btnClose = document.getElementById('btnCloseSearchLogModal');
    const btnCancel = document.getElementById('btnCancelSearchLogModal');
    if (btnClose) btnClose.addEventListener('click', () => this.closeModal());
    if (btnCancel) btnCancel.addEventListener('click', () => this.closeModal());

    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveEntry();
      });
    }

    window.addEventListener('proj201:datachange', () => {
      this.render();
    });
  }

  render() {
    this.renderTable();
    this.renderFunnelChart();
  }

  renderTable() {
    if (!this.tableBody) return;
    const logs = window.storage.getSearchLogs();

    if (logs.length === 0) {
      this.tableBody.innerHTML = `
        <tr><td colspan="8" class="text-center text-muted p-3">No search logs recorded yet.</td></tr>
      `;
      return;
    }

    this.tableBody.innerHTML = logs.map(l => {
      const diseaseTagClass = l.disease === "Alzheimer's Disease" ? 'tag-ad' :
                              l.disease === "Glioblastoma" ? 'tag-gbm' : 'tag-stroke';

      return `
        <tr>
          <td class="font-mono text-xs text-muted" style="white-space: nowrap;">${l.date}</td>
          <td><span class="disease-tag ${diseaseTagClass}">${l.disease}</span></td>
          <td>
            <div class="text-xs" style="max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${l.query}">
              ${l.query}
            </div>
            <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="text-xs text-primary font-mono">
              View Search &nearr;
            </a>
          </td>
          <td><span class="font-mono font-bold">${l.step1Count ? l.step1Count.toLocaleString() : 'N/A'}</span></td>
          <td><span class="font-mono">${l.step3Count ? l.step3Count.toLocaleString() : 'N/A'}</span></td>
          <td><span class="font-mono">${l.step5Count ? l.step5Count.toLocaleString() : 'N/A'}</span></td>
          <td><span class="font-mono font-bold text-success">${l.step7Count ? l.step7Count.toLocaleString() : 'N/A'}</span></td>
          <td><span class="text-xs text-muted">${l.loggedBy || 'Student'}</span></td>
        </tr>
      `;
    }).join('');
  }

  renderFunnelChart() {
    const canvas = document.getElementById('funnelChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const logs = window.storage.getSearchLogs();
    const adLog = logs.find(l => l.disease === "Alzheimer's Disease") || {};
    const gbmLog = logs.find(l => l.disease === "Glioblastoma") || {};
    const strokeLog = logs.find(l => l.disease === "Stroke") || {};

    const steps = ['Step 1: All', 'Step 3: Ph II/III', 'Step 5: Drug/Bio', 'Step 7: Eligible'];

    const data = {
      labels: steps,
      datasets: [
        {
          label: "Alzheimer's Disease",
          data: [adLog.step1Count || 0, adLog.step3Count || 0, adLog.step5Count || 0, adLog.step7Count || 0],
          backgroundColor: 'rgba(124, 58, 237, 0.7)',
          borderColor: '#7c3aed',
          borderWidth: 2,
          fill: false,
          tension: 0.2
        },
        {
          label: 'Glioblastoma',
          data: [gbmLog.step1Count || 0, gbmLog.step3Count || 0, gbmLog.step5Count || 0, gbmLog.step7Count || 0],
          backgroundColor: 'rgba(225, 29, 72, 0.7)',
          borderColor: '#e11d48',
          borderWidth: 2,
          fill: false,
          tension: 0.2
        },
        {
          label: 'Stroke',
          data: [strokeLog.step1Count || 0, strokeLog.step3Count || 0, strokeLog.step5Count || 0, strokeLog.step7Count || 0],
          backgroundColor: 'rgba(234, 88, 12, 0.7)',
          borderColor: '#ea580c',
          borderWidth: 2,
          fill: false,
          tension: 0.2
        }
      ]
    };

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(canvas, {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11, family: 'Plus Jakarta Sans' } } },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          y: {
            type: 'logarithmic',
            title: { display: true, text: 'Clinical Trials Count (Log Scale)', font: { size: 11 } },
            ticks: { font: { size: 10 } }
          },
          x: {
            ticks: { font: { size: 10 } }
          }
        }
      }
    });
  }

  openModal() {
    if (this.form) this.form.reset();
    document.getElementById('searchLogDate').value = new Date().toISOString().split('T')[0];

    const activeProfile = window.storage.getActiveUserProfile();
    const diseaseSelect = document.getElementById('searchLogDisease');
    if (diseaseSelect && activeProfile.diseaseScope && activeProfile.diseaseScope !== 'ALL') {
      diseaseSelect.value = activeProfile.diseaseScope;
    }

    if (this.modalBackdrop) this.modalBackdrop.classList.remove('d-none');
  }

  closeModal() {
    if (this.modalBackdrop) this.modalBackdrop.classList.add('d-none');
  }

  saveEntry() {
    const activeProfile = window.storage.getActiveUserProfile();
    const entry = {
      date: document.getElementById('searchLogDate').value,
      disease: document.getElementById('searchLogDisease').value,
      query: document.getElementById('searchLogQuery').value.trim(),
      url: document.getElementById('searchLogUrl').value.trim(),
      step1Count: parseInt(document.getElementById('searchLogStep1').value, 10) || null,
      step3Count: parseInt(document.getElementById('searchLogStep3').value, 10) || null,
      step5Count: parseInt(document.getElementById('searchLogStep5').value, 10) || null,
      step7Count: parseInt(document.getElementById('searchLogStep7').value, 10) || null,
      notes: document.getElementById('searchLogNotes').value.trim(),
      loggedBy: activeProfile.name
    };

    window.storage.addSearchLog(entry);
    this.closeModal();
    window.app.showToast(`Search log entry recorded for ${entry.disease}!`, 'success');
  }
}

// Global instance
window.searchLog = new SearchLogController();
