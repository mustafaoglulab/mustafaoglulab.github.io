/**
 * PROJ 201: Peer Quality Control (QC) & Verification Workflow
 * Mustafaoglu Lab · Sabancı University · Fall 2026
 */

class QCWorkflowController {
  constructor() {
    this.queueTableBody = document.getElementById('qcQueueTableBody');
    this.queueEmptyState = document.getElementById('qcQueueEmptyState');
    this.qcLogTableBody = document.getElementById('qcLogTableBody');
    this.modalBackdrop = document.getElementById('verifyModalBackdrop');
    this.verifyForm = document.getElementById('verifyForm');

    this.initEventListeners();
  }

  initEventListeners() {
    const btnClose = document.getElementById('btnCloseVerifyModal');
    const btnCancel = document.getElementById('btnCancelVerifyModal');
    if (btnClose) btnClose.addEventListener('click', () => this.closeVerifyModal());
    if (btnCancel) btnCancel.addEventListener('click', () => this.closeVerifyModal());

    if (this.verifyForm) {
      this.verifyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitVerification();
      });
    }

    window.addEventListener('proj201:datachange', () => {
      this.render();
    });
  }

  render() {
    this.renderQueue();
    this.renderQcLog();
  }

  renderQueue() {
    if (!this.queueTableBody) return;
    const trials = window.storage.getTrials();
    const pending = trials.filter(t => t.qcStatus !== 'Verified');

    const queueCountBadge = document.getElementById('qcQueueCount');
    if (queueCountBadge) queueCountBadge.textContent = `${pending.length} Studies`;

    if (pending.length === 0) {
      this.queueTableBody.innerHTML = '';
      if (this.queueEmptyState) this.queueEmptyState.classList.remove('d-none');
      return;
    }

    if (this.queueEmptyState) this.queueEmptyState.classList.add('d-none');

    this.queueTableBody.innerHTML = pending.map(t => {
      const diseaseTagClass = t.disease === "Alzheimer's Disease" ? 'tag-ad' :
                              t.disease === "Glioblastoma" ? 'tag-gbm' : 'tag-stroke';
      const qcBadgeClass = t.qcStatus === 'Needs Revision' ? 'badge-danger' : 'badge-warning';

      return `
        <tr>
          <td>
            <a href="${t.registryUrl || '#'}" target="_blank" rel="noopener noreferrer" class="nct-cell">
              ${t.nctId}
            </a>
          </td>
          <td><span class="disease-tag ${diseaseTagClass}">${t.disease}</span></td>
          <td><strong>${t.drugName}</strong></td>
          <td><span class="text-sm font-semibold">${t.extractor || 'Unknown'}</span></td>
          <td><span class="badge ${qcBadgeClass}">${t.qcStatus}</span></td>
          <td><div class="text-xs text-muted" style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.primaryOutcomeDetail || t.outcomeClass}</div></td>
          <td class="text-right">
            <button class="btn btn-warning btn-sm" style="padding: 0.25rem 0.65rem; font-size: 0.75rem;" onclick="window.qcWorkflow.openVerifyModal('${t.id}')">
              Verify / Sign-Off
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderQcLog() {
    if (!this.qcLogTableBody) return;
    const logs = window.storage.getQcLog();

    if (logs.length === 0) {
      this.qcLogTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted p-3">No verification logs recorded yet.</td>
        </tr>
      `;
      return;
    }

    this.qcLogTableBody.innerHTML = logs.map(l => {
      const decisionBadge = l.decision === 'Verified' ? 'badge-success' : 'badge-danger';
      return `
        <tr>
          <td class="font-mono text-xs text-muted" style="white-space: nowrap;">${l.date}</td>
          <td><strong class="font-mono text-primary">${l.nctId}</strong></td>
          <td>${l.extractor}</td>
          <td><strong>${l.verifier}</strong></td>
          <td><span class="badge ${decisionBadge}">${l.decision}</span></td>
          <td class="text-sm">${l.notes}</td>
        </tr>
      `;
    }).join('');
  }

  openVerifyModal(trialId) {
    const trial = window.storage.getTrialById(trialId);
    if (!trial) return;

    document.getElementById('verifyTrialId').value = trial.id;
    document.getElementById('verifyNctId').textContent = trial.nctId;
    document.getElementById('verifyDrugName').textContent = trial.drugName;
    document.getElementById('verifyStudyTitle').textContent = trial.title;
    document.getElementById('verifyExtractorName').textContent = trial.extractor || 'Student';

    // Reset checkboxes
    for (let i = 1; i <= 5; i++) {
      const chk = document.getElementById(`qcCheck${i}`);
      if (chk) chk.checked = false;
    }

    document.getElementById('verifyDecision').value = 'Verified';
    document.getElementById('verifyNotes').value = '';

    this.modalBackdrop.classList.remove('d-none');
  }

  closeVerifyModal() {
    if (this.modalBackdrop) this.modalBackdrop.classList.add('d-none');
  }

  submitVerification() {
    const trialId = document.getElementById('verifyTrialId').value;
    const decision = document.getElementById('verifyDecision').value;
    const notes = document.getElementById('verifyNotes').value.trim();
    const activeProfile = window.storage.getActiveUserProfile();

    const trial = window.storage.getTrialById(trialId);
    if (!trial) return;

    // Update trial
    trial.qcStatus = decision;
    trial.checker = activeProfile.name;
    trial.qcNotes = (trial.qcNotes ? trial.qcNotes + '\n' : '') + `[${new Date().toLocaleDateString()}] ${activeProfile.name} (${decision}): ${notes}`;

    window.storage.saveTrial(trial);

    // Add to QC Log
    window.storage.addQcLogEntry({
      trialId: trial.id,
      nctId: trial.nctId,
      extractor: trial.extractor || 'Unknown',
      verifier: activeProfile.name,
      decision: decision,
      notes: notes
    });

    this.closeVerifyModal();
    window.app.showToast(`Peer verification sign-off submitted for ${trial.nctId} (${decision})`, decision === 'Verified' ? 'success' : 'warning');
  }
}

// Global instance
window.qcWorkflow = new QCWorkflowController();
