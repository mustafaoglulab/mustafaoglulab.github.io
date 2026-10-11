/**
 * PROJ 201: Weekly Roadmap & Deliverables Tracker
 * Mustafaoglu Lab · Sabancı University · Fall 2026
 */

class WeeklyTrackerController {
  constructor() {
    this.accordionContainer = document.getElementById('weeklyAccordion');
    this.finalChecklistContainer = document.getElementById('finalChecklistContainer');
    this.progressTableBody = document.getElementById('weeklyProgressTableBody');
    this.modalBackdrop = document.getElementById('weeklyReportModalBackdrop');
    this.reportForm = document.getElementById('weeklyReportForm');

    this.initEventListeners();
  }

  initEventListeners() {
    // Open Weekly Report Modal
    const btnOpenReport = document.getElementById('btnSubmitWeeklyReport');
    if (btnOpenReport) {
      btnOpenReport.addEventListener('click', () => this.openReportModal());
    }

    const btnClose = document.getElementById('btnCloseWeeklyModal');
    const btnCancel = document.getElementById('btnCancelWeeklyModal');
    if (btnClose) btnClose.addEventListener('click', () => this.closeReportModal());
    if (btnCancel) btnCancel.addEventListener('click', () => this.closeReportModal());

    if (this.reportForm) {
      this.reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveWeeklyReport();
      });
    }

    window.addEventListener('proj201:datachange', () => {
      this.render();
    });
  }

  render() {
    this.renderAccordion();
    this.renderFinalChecklist();
    this.renderProgressReports();
  }

  renderAccordion() {
    if (!this.accordionContainer) return;
    const weeks = window.storage.getWeeks();

    this.accordionContainer.innerHTML = weeks.map((w, index) => {
      const phaseClass = `phase-${w.phase}`;
      const completedTasks = (w.tasks || []).filter(t => t.completed).length;
      const totalTasks = (w.tasks || []).length;
      const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const isOpen = (index === 0) ? 'open' : ''; // Open first week by default

      return `
        <div class="week-card ${phaseClass} ${isOpen}" id="week-card-${w.weekNumber}">
          <div class="week-card-header" onclick="window.weeklyTracker.toggleWeekCard(${w.weekNumber})">
            <div class="week-title-wrap">
              <span class="week-badge">Week ${w.weekNumber}</span>
              <span class="week-topic">${w.title}</span>
              <span class="week-dates">${w.dates}</span>
              ${w.majorDeadline ? `<span class="badge badge-danger">${w.majorDeadline}</span>` : ''}
              ${w.officialEvent ? `<span class="badge badge-info">${w.officialEvent}</span>` : ''}
            </div>
            <div class="week-progress-indicator">
              <span>${completedTasks}/${totalTasks} Tasks</span>
              <div class="metric-progress-bar" style="width: 80px; height: 6px; margin-top: 0;">
                <div class="metric-progress-fill" style="width: ${pct}%"></div>
              </div>
            </div>
          </div>

          <div class="week-card-body">
            <div class="text-sm mb-3 text-muted">
              <strong>Learning Goal:</strong> ${w.learningGoal}
            </div>

            <div class="week-tasks-list">
              ${(w.tasks || []).map(task => `
                <div class="week-task-item">
                  <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''} onchange="window.weeklyTracker.toggleTask(${w.weekNumber}, '${task.id}', this.checked)">
                  <label for="task-${task.id}">${task.text}</label>
                </div>
              `).join('')}
            </div>

            <div class="week-deliverables-pill">
              <strong>Weekly Deliverables:</strong> ${w.deliverables}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  toggleWeekCard(weekNumber) {
    const card = document.getElementById(`week-card-${weekNumber}`);
    if (card) {
      card.classList.toggle('open');
    }
  }

  toggleTask(weekNumber, taskId, isChecked) {
    window.storage.updateTaskStatus(weekNumber, taskId, isChecked);
    // Re-render accordion header progress
    this.renderAccordion();
  }

  renderFinalChecklist() {
    if (!this.finalChecklistContainer) return;
    const items = window.storage.getFinalChecklist();

    this.finalChecklistContainer.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr; gap: 0.5rem;">
        ${items.map(item => `
          <div class="qc-check-item" style="background: #ffffff; border: 1px solid var(--color-border);">
            <input type="checkbox" id="${item.id}" ${item.checked ? 'checked' : ''} onchange="window.weeklyTracker.toggleFinalItem('${item.id}', this.checked)">
            <label for="${item.id}"><strong>[ ]</strong> ${item.text}</label>
          </div>
        `).join('')}
      </div>
    `;
  }

  toggleFinalItem(itemId, isChecked) {
    window.storage.updateFinalChecklist(itemId, isChecked);
  }

  renderProgressReports() {
    if (!this.progressTableBody) return;
    const reports = window.storage.getWeeklyProgressReports();

    if (reports.length === 0) {
      this.progressTableBody.innerHTML = `
        <tr><td colspan="6" class="text-center text-muted p-3">No weekly progress reports submitted yet.</td></tr>
      `;
      return;
    }

    this.progressTableBody.innerHTML = reports.map(r => `
      <tr>
        <td><span class="badge badge-secondary font-mono">Week ${r.weekNumber}</span></td>
        <td><strong>${r.group}</strong></td>
        <td><div class="text-xs text-muted">${r.submittedBy} (${r.submissionDate})</div></td>
        <td>
          <div class="text-xs font-mono">
            ID: ${r.identifiedCount || 0} · Screen: ${r.screenedCount || 0} · Valid: ${r.validatedCount || 0}
          </div>
        </td>
        <td><div class="text-xs" style="max-width: 250px;">${r.completedTasks}</div></td>
        <td>
          <div class="text-xs text-muted" style="max-width: 250px;">
            <div><strong>Next:</strong> ${r.nextSteps}</div>
            ${r.problems ? `<div class="text-danger mt-1"><strong>Hurdles:</strong> ${r.problems}</div>` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  }

  openReportModal() {
    if (this.reportForm) this.reportForm.reset();
    const activeProfile = window.storage.getActiveUserProfile();
    const groupSelect = document.getElementById('reportGroupSelect');
    if (groupSelect && activeProfile.group && activeProfile.group !== 'Supervisor') {
      groupSelect.value = activeProfile.group;
    }

    if (this.modalBackdrop) this.modalBackdrop.classList.remove('d-none');
  }

  closeReportModal() {
    if (this.modalBackdrop) this.modalBackdrop.classList.add('d-none');
  }

  saveWeeklyReport() {
    const activeProfile = window.storage.getActiveUserProfile();
    const reportData = {
      weekNumber: parseInt(document.getElementById('reportWeekNumber').value, 10),
      group: document.getElementById('reportGroupSelect').value,
      submittedBy: activeProfile.name,
      submissionDate: new Date().toISOString().split('T')[0],
      identifiedCount: parseInt(document.getElementById('reportIdentified').value, 10) || 0,
      screenedCount: parseInt(document.getElementById('reportScreened').value, 10) || 0,
      validatedCount: parseInt(document.getElementById('reportValidated').value, 10) || 0,
      completedTasks: document.getElementById('reportCompletedTasks').value.trim(),
      problems: document.getElementById('reportProblems').value.trim(),
      contributions: document.getElementById('reportContributions').value.trim(),
      nextSteps: document.getElementById('reportNextSteps').value.trim()
    };

    window.storage.addWeeklyProgressReport(reportData);
    this.closeReportModal();
    window.app.showToast(`Week ${reportData.weekNumber} progress report recorded for ${reportData.group}!`, 'success');
  }
}

// Global instance
window.weeklyTracker = new WeeklyTrackerController();
