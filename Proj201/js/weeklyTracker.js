/**
 * PROJ 201: Weekly Progress Tracker (08_WEEKLY_PROGRESS)
 * Manages 1-Row-Per-Student-Per-Week Progress Logs (Section 5)
 * Mustafaoglu Lab · Sabancı University · Fall 2026
 */

class WeeklyTrackerController {
  constructor() {
    this.tableBody = document.getElementById('bodyWeeklyProgress');
    this.modalBackdrop = document.getElementById('weeklyModalBackdrop');
    this.form = document.getElementById('weeklyRowForm');

    this.initEventListeners();
  }

  initEventListeners() {
    // Open Modal button
    const btnOpen = document.getElementById('btnOpenWeeklyModal');
    if (btnOpen) {
      btnOpen.addEventListener('click', () => this.openModal());
    }

    // Close Modal buttons
    const btnClose = document.getElementById('btnCloseWeeklyModal');
    const btnCancel = document.getElementById('btnCancelWeeklyModal');
    if (btnClose) btnClose.addEventListener('click', () => this.closeModal());
    if (btnCancel) btnCancel.addEventListener('click', () => this.closeModal());

    // Form submit
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveWeeklyRow();
      });
    }

    // React to data updates
    window.addEventListener('proj201:datachange', () => {
      this.render();
    });
  }

  render() {
    if (!this.tableBody) return;
    const rows = window.storage.getWeeklyProgress();

    if (rows.length === 0) {
      this.tableBody.innerHTML = `
        <tr><td colspan="7" class="text-center text-muted p-3">No weekly progress logged yet. Click "Add Weekly Entry" to log this week's progress.</td></tr>
      `;
      return;
    }

    // Sort by week descending, then student
    const sorted = [...rows].sort((a, b) => {
      if (b.week !== a.week) return b.week - a.week;
      return (a.student || '').localeCompare(b.student || '');
    });

    this.tableBody.innerHTML = sorted.map(row => {
      const disClass = row.group === "Alzheimer's" ? 'pill-ad' :
                       row.group === "GBM" ? 'pill-gbm' : 'pill-stroke';

      const hasChallenge = row.challenges && row.challenges !== '—' && row.challenges !== '-';

      return `
        <tr>
          <td><span class="badge badge-secondary font-mono">Week ${row.week}</span></td>
          <td><strong>${this.escapeHtml(row.student)}</strong></td>
          <td><span class="pill ${disClass}">${this.escapeHtml(row.group)}</span></td>
          <td>
            <div class="text-sm" style="max-width: 280px;">${this.escapeHtml(row.tasksCompleted)}</div>
          </td>
          <td>
            <span class="font-mono text-xs font-bold text-main">${this.escapeHtml(row.trialsAddedVerified || '—')}</span>
          </td>
          <td>
            <div class="text-xs ${hasChallenge ? 'text-danger' : 'text-muted'}" style="max-width: 220px;">
              ${this.escapeHtml(row.challenges || '—')}
            </div>
          </td>
          <td>
            <div class="text-xs text-primary" style="max-width: 220px;">
              ${this.escapeHtml(row.nextSteps || '—')}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  openModal() {
    if (!this.modalBackdrop) return;
    if (this.form) this.form.reset();

    const activeProfile = window.storage.getActiveUserProfile();

    // Pre-populate student and group
    const studentInput = document.getElementById('wpStudent');
    const groupSelect = document.getElementById('wpGroup');

    if (studentInput) {
      studentInput.value = activeProfile.name || 'Student';
    }

    if (groupSelect && activeProfile.group && activeProfile.group !== 'Supervisor') {
      groupSelect.value = activeProfile.group;
    }

    this.modalBackdrop.classList.remove('d-none');
  }

  closeModal() {
    if (this.modalBackdrop) this.modalBackdrop.classList.add('d-none');
  }

  saveWeeklyRow() {
    const activeProfile = window.storage.getActiveUserProfile();

    const rowData = {
      week: parseInt(document.getElementById('wpWeek').value, 10) || 1,
      student: document.getElementById('wpStudent').value.trim() || activeProfile.name,
      group: document.getElementById('wpGroup').value,
      tasksCompleted: document.getElementById('wpTasks').value.trim(),
      trialsAddedVerified: document.getElementById('wpTrials').value.trim(),
      challenges: document.getElementById('wpChallenges').value.trim() || '—',
      nextSteps: document.getElementById('wpNextSteps').value.trim()
    };

    window.storage.addWeeklyProgressRow(rowData);
    this.closeModal();

    if (window.app && window.app.showToast) {
      window.app.showToast(`Week ${rowData.week} entry logged for ${rowData.student}!`, 'success');
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
window.weeklyTracker = new WeeklyTrackerController();
