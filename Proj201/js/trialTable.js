/**
 * PROJ 201: Clinical Trial Table & Detail View Controller
 * Mustafaoglu Lab · Sabancı University · Fall 2026
 */

class TrialTableController {
  constructor() {
    this.currentDiseaseFilter = 'ALL';
    this.searchQuery = '';
    this.outcomeFilter = 'ALL';
    this.qcFilter = 'ALL';
    this.phaseFilter = 'ALL';

    this.tableBody = document.getElementById('trialsTableBody');
    this.emptyState = document.getElementById('tableEmptyState');

    this.initEventListeners();
  }

  initEventListeners() {
    // Disease chip buttons
    const diseaseChips = document.querySelectorAll('.disease-filter-group .filter-chip');
    diseaseChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        diseaseChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentDiseaseFilter = chip.dataset.disease;
        this.render();
      });
    });

    // Search bar
    const searchInput = document.getElementById('trialSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.render();
      });
    }

    // Secondary select filters
    const outcomeSelect = document.getElementById('outcomeFilterSelect');
    if (outcomeSelect) {
      outcomeSelect.addEventListener('change', (e) => {
        this.outcomeFilter = e.target.value;
        this.render();
      });
    }

    const qcSelect = document.getElementById('qcFilterSelect');
    if (qcSelect) {
      qcSelect.addEventListener('change', (e) => {
        this.qcFilter = e.target.value;
        this.render();
      });
    }

    const phaseSelect = document.getElementById('phaseFilterSelect');
    if (phaseSelect) {
      phaseSelect.addEventListener('change', (e) => {
        this.phaseFilter = e.target.value;
        this.render();
      });
    }

    // Listen to data change events
    window.addEventListener('proj201:datachange', () => {
      this.render();
      this.updateCounts();
    });
  }

  getFilteredTrials() {
    let trials = window.storage.getTrials();

    // Disease filter
    if (this.currentDiseaseFilter !== 'ALL') {
      trials = trials.filter(t => t.disease === this.currentDiseaseFilter);
    }

    // Outcome filter
    if (this.outcomeFilter !== 'ALL') {
      trials = trials.filter(t => t.outcomeClass === this.outcomeFilter);
    }

    // QC filter
    if (this.qcFilter !== 'ALL') {
      trials = trials.filter(t => t.qcStatus === this.qcFilter);
    }

    // Phase filter
    if (this.phaseFilter !== 'ALL') {
      trials = trials.filter(t => t.phase.includes(this.phaseFilter.replace('Phase ', '')));
    }

    // Text search query
    if (this.searchQuery) {
      const q = this.searchQuery;
      trials = trials.filter(t => 
        (t.nctId && t.nctId.toLowerCase().includes(q)) ||
        (t.drugName && t.drugName.toLowerCase().includes(q)) ||
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.mechanism && t.mechanism.toLowerCase().includes(q)) ||
        (t.molecularTarget && t.molecularTarget.toLowerCase().includes(q)) ||
        (t.disease && t.disease.toLowerCase().includes(q)) ||
        (t.citation && t.citation.toLowerCase().includes(q)) ||
        (t.docReason && t.docReason.toLowerCase().includes(q))
      );
    }

    return trials;
  }

  render() {
    if (!this.tableBody) return;
    const filtered = this.getFilteredTrials();

    if (filtered.length === 0) {
      this.tableBody.innerHTML = '';
      if (this.emptyState) this.emptyState.classList.remove('d-none');
      return;
    }

    if (this.emptyState) this.emptyState.classList.add('d-none');

    this.tableBody.innerHTML = filtered.map(trial => {
      const diseaseTagClass = trial.disease === "Alzheimer's Disease" ? 'tag-ad' :
                              trial.disease === "Glioblastoma" ? 'tag-gbm' : 'tag-stroke';
      
      const outcomeBadgeClass = trial.outcomeClass === 'Positive outcome' ? 'badge-success' :
                                trial.outcomeClass === 'Negative outcome' ? 'badge-danger' :
                                trial.outcomeClass === 'Mixed / Inconclusive' ? 'badge-warning' :
                                trial.outcomeClass === 'Terminated / Discontinued' ? 'badge-dark' : 'badge-secondary';

      const qcBadgeClass = trial.qcStatus === 'Verified' ? 'badge-success' :
                           trial.qcStatus === 'Pending Verification' ? 'badge-warning' :
                           trial.qcStatus === 'Needs Revision' ? 'badge-danger' : 'badge-secondary';

      return `
        <tr data-id="${trial.id}">
          <td>
            <a href="${trial.registryUrl || '#'}" target="_blank" rel="noopener noreferrer" class="nct-cell" title="View on ClinicalTrials.gov">
              ${trial.nctId}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-left: 2px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
            <div class="text-xs text-muted">${trial.status || 'Completed'}</div>
          </td>
          <td>
            <strong style="color: var(--color-text-main);">${trial.drugName || 'Unnamed'}</strong>
            <div class="text-xs text-muted" style="max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${trial.title}">
              ${trial.title}
            </div>
            <div class="text-xs" style="color: var(--color-primary);">${trial.mechanism || ''}</div>
          </td>
          <td>
            <span class="disease-tag ${diseaseTagClass}">${trial.disease}</span>
          </td>
          <td>
            <span class="badge badge-secondary font-mono">${trial.phase || 'N/A'}</span>
          </td>
          <td>
            <span class="badge ${outcomeBadgeClass}">${trial.outcomeClass}</span>
          </td>
          <td>
            <div class="text-xs" style="max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${trial.primaryEndpoint}">
              ${trial.primaryEndpoint}
            </div>
            <div class="text-xs text-muted">${trial.enrollment ? 'N=' + trial.enrollment : ''}</div>
          </td>
          <td>
            <span class="badge ${qcBadgeClass}">${trial.qcStatus}</span>
          </td>
          <td class="text-right" style="white-space: nowrap;">
            <button class="table-action-btn" onclick="window.trialTable.openDetailModal('${trial.id}')" title="View Full Protocol Card">
              View
            </button>
            <button class="table-action-btn" onclick="window.trialForm.openEditModal('${trial.id}')" title="Edit Clinical Trial">
              Edit
            </button>
            ${trial.qcStatus !== 'Verified' ? `
              <button class="table-action-btn btn-action-verify" onclick="window.qcWorkflow.openVerifyModal('${trial.id}')" title="Peer Verification Sign-off">
                Verify
              </button>
            ` : ''}
          </td>
        </tr>
      `;
    }).join('');
  }

  updateCounts() {
    const trials = window.storage.getTrials();
    const countAll = trials.length;
    const countAd = trials.filter(t => t.disease === "Alzheimer's Disease").length;
    const countGbm = trials.filter(t => t.disease === "Glioblastoma").length;
    const countStroke = trials.filter(t => t.disease === "Stroke").length;
    const countPending = trials.filter(t => t.qcStatus === "Pending Verification").length;
    const countVerified = trials.filter(t => t.qcStatus === "Verified").length;

    // Filter chip counts
    const elAll = document.getElementById('countFilterAll');
    if (elAll) elAll.textContent = countAll;
    const elAd = document.getElementById('countFilterAd');
    if (elAd) elAd.textContent = countAd;
    const elGbm = document.getElementById('countFilterGbm');
    if (elGbm) elGbm.textContent = countGbm;
    const elStroke = document.getElementById('countFilterStroke');
    if (elStroke) elStroke.textContent = countStroke;

    // Badges in header navigation
    const totalBadge = document.getElementById('totalTrialsBadge');
    if (totalBadge) totalBadge.textContent = countAll;
    const pendingBadge = document.getElementById('pendingQcBadge');
    if (pendingBadge) pendingBadge.textContent = countPending;

    // Dashboard metrics
    const statTotal = document.getElementById('statTotalTrials');
    if (statTotal) statTotal.textContent = countAll;
    const statProgress = document.getElementById('statTotalProgress');
    if (statProgress) {
      const pct = Math.min(100, Math.round((countAll / 45) * 100));
      statProgress.style.width = `${pct}%`;
    }

    const statAd = document.getElementById('statAdTrials');
    if (statAd) statAd.textContent = countAd;
    const statAdVer = document.getElementById('statAdVerified');
    if (statAdVer) {
      const adVerCount = trials.filter(t => t.disease === "Alzheimer's Disease" && t.qcStatus === "Verified").length;
      statAdVer.textContent = `${adVerCount} verified`;
    }

    const statGbm = document.getElementById('statGbmTrials');
    if (statGbm) statGbm.textContent = countGbm;
    const statGbmVer = document.getElementById('statGbmVerified');
    if (statGbmVer) {
      const gbmVerCount = trials.filter(t => t.disease === "Glioblastoma" && t.qcStatus === "Verified").length;
      statGbmVer.textContent = `${gbmVerCount} verified`;
    }

    const statStroke = document.getElementById('statStrokeTrials');
    if (statStroke) statStroke.textContent = countStroke;
    const statStrokeVer = document.getElementById('statStrokeVerified');
    if (statStrokeVer) {
      const strokeVerCount = trials.filter(t => t.disease === "Stroke" && t.qcStatus === "Verified").length;
      statStrokeVer.textContent = `${strokeVerCount} verified`;
    }

    const statQcVer = document.getElementById('statQcVerified');
    if (statQcVer) statQcVer.textContent = countVerified;
    const statQcPen = document.getElementById('statQcPending');
    if (statQcPen) statQcPen.textContent = `${countPending} pending review`;

    const quickPen = document.getElementById('quickPendingCount');
    if (quickPen) quickPen.textContent = countPending;
  }

  openDetailModal(id) {
    const trial = window.storage.getTrialById(id);
    if (!trial) return;

    const modalBackdrop = document.getElementById('viewDetailModalBackdrop');
    const modalTitle = document.getElementById('viewDetailModalTitle');
    const modalBody = document.getElementById('viewDetailModalBody');
    const diseaseBadge = document.getElementById('detailDiseaseBadge');
    const outcomeBadge = document.getElementById('detailOutcomeBadge');
    const qcBadge = document.getElementById('detailQcBadge');
    const btnVerify = document.getElementById('btnDetailVerify');
    const btnEdit = document.getElementById('btnDetailEdit');

    if (!modalBackdrop || !modalBody) return;

    modalTitle.textContent = `${trial.nctId}: ${trial.drugName}`;

    // Badges
    diseaseBadge.className = `badge ${trial.disease === "Alzheimer's Disease" ? 'tag-ad' : trial.disease === "Glioblastoma" ? 'tag-gbm' : 'tag-stroke'}`;
    diseaseBadge.textContent = trial.disease;

    outcomeBadge.className = `badge ${trial.outcomeClass === 'Positive outcome' ? 'badge-success' : trial.outcomeClass === 'Negative outcome' ? 'badge-danger' : 'badge-warning'}`;
    outcomeBadge.textContent = trial.outcomeClass;

    qcBadge.className = `badge ${trial.qcStatus === 'Verified' ? 'badge-success' : 'badge-warning'}`;
    qcBadge.textContent = `QC: ${trial.qcStatus}`;

    // Action handlers in detail modal
    if (btnEdit) {
      btnEdit.onclick = () => {
        this.closeDetailModal();
        window.trialForm.openEditModal(trial.id);
      };
    }

    if (btnVerify) {
      btnVerify.onclick = () => {
        this.closeDetailModal();
        window.qcWorkflow.openVerifyModal(trial.id);
      };
    }

    // Build rich detail card body
    modalBody.innerHTML = `
      <div class="mb-3">
        <h4 style="font-size: 1.1rem; color: var(--color-text-main); margin-bottom: 0.35rem;">${trial.title}</h4>
        <div class="text-sm">
          <a href="${trial.registryUrl}" target="_blank" rel="noopener noreferrer" class="font-mono text-primary font-bold">
            ${trial.nctId} on ClinicalTrials.gov &nearr;
          </a>
        </div>
      </div>

      <!-- Section 1: Study Design & Population -->
      <h5 class="text-sm font-bold text-muted text-uppercase mb-2">1. Trial Design & Patient Population</h5>
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">Phase &amp; Status</span>
          <span class="detail-value">${trial.phase} · ${trial.status} (${trial.startDate || 'N/A'} &rarr; ${trial.completionDate || 'N/A'})</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Design &amp; Control</span>
          <span class="detail-value">${trial.randomization || 'Randomized'}, ${trial.blinding || 'Double-blind'} vs ${trial.comparator || 'Placebo'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Enrollment (N)</span>
          <span class="detail-value">${trial.enrollment ? trial.enrollment.toLocaleString() + ' patients' : 'Not reported'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Disease Stage / Clinical Subtype</span>
          <span class="detail-value">${trial.diseaseStage || 'Not specified'}</span>
        </div>
      </div>
      ${trial.eligibility ? `
        <div class="detail-item mb-3">
          <span class="detail-label">Key Eligibility Criteria</span>
          <div class="text-xs text-muted mt-1">${trial.eligibility}</div>
        </div>
      ` : ''}

      <!-- Section 2: Intervention & Mechanism -->
      <h5 class="text-sm font-bold text-muted text-uppercase mb-2 mt-3">2. Investigational Drug & Mechanism</h5>
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">Drug Name &amp; Molecular Target</span>
          <span class="detail-value">${trial.drugName} (Target: ${trial.molecularTarget || 'N/A'})</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Therapeutic Mechanism / Class</span>
          <span class="detail-value">${trial.mechanism}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Route &amp; Regimen</span>
          <span class="detail-value">${trial.adminRoute || 'IV'} · ${trial.dosingRegimen || 'Standard'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">BBB Delivery Assessment</span>
          <span class="detail-value">${trial.bbbFactor || 'Not reported'}</span>
        </div>
      </div>

      <!-- Section 3: Endpoints, Efficacy & Safety -->
      <h5 class="text-sm font-bold text-muted text-uppercase mb-2 mt-3">3. Endpoints & Clinical Outcomes</h5>
      <div class="detail-item mb-2">
        <span class="detail-label">Primary Endpoint(s)</span>
        <span class="detail-value">${trial.primaryEndpoint}</span>
        ${trial.primaryOutcomeDetail ? `<div class="text-xs mt-1 text-primary"><strong>Outcome Detail:</strong> ${trial.primaryOutcomeDetail}</div>` : ''}
      </div>
      ${trial.secondaryEndpoints ? `
        <div class="detail-item mb-2">
          <span class="detail-label">Secondary Endpoints</span>
          <div class="text-xs text-muted mt-1">${trial.secondaryEndpoints}</div>
        </div>
      ` : ''}
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">Reported Efficacy</span>
          <div class="text-xs mt-1">${trial.efficacySummary || 'Not reported'}</div>
        </div>
        <div class="detail-item">
          <span class="detail-label">Safety &amp; Adverse Events</span>
          <div class="text-xs mt-1 text-danger">${trial.safetySummary || 'Not reported'}</div>
        </div>
      </div>

      <!-- Section 4: Documented Reasons vs Possible Contributing Factors -->
      <h5 class="text-sm font-bold text-muted text-uppercase mb-2 mt-3">4. Documented Reasons vs Translational Contributing Factors</h5>
      <div class="detail-item mb-2" style="border-left: 4px solid var(--color-danger);">
        <span class="detail-label text-danger">Explicitly Documented Reason for Failure / Termination</span>
        <div class="text-sm mt-1"><strong>${trial.docReason || 'None documented'}</strong></div>
        <div class="text-xs text-muted mt-1">Category: <strong>${trial.failureCategory || 'N/A'}</strong></div>
      </div>
      <div class="detail-item mb-3" style="border-left: 4px solid var(--color-primary);">
        <span class="detail-label text-primary">Possible Contributing Factors (Literature-Supported Hypotheses)</span>
        <div class="text-xs mt-1">${trial.contribFactors || 'No literature hypotheses recorded yet.'}</div>
      </div>

      <!-- Section 5: References & QC Audit Trail -->
      <h5 class="text-sm font-bold text-muted text-uppercase mb-2 mt-3">5. Evidence & Quality Control</h5>
      <div class="detail-grid mb-2">
        <div class="detail-item">
          <span class="detail-label">Publication References</span>
          <div class="text-xs mt-1">
            ${trial.doi ? `<div>DOI: <a href="https://doi.org/${trial.doi}" target="_blank" rel="noopener noreferrer">${trial.doi}</a></div>` : ''}
            ${trial.pmid ? `<div>PMID: <a href="https://pubmed.ncbi.nlm.nih.gov/${trial.pmid}" target="_blank" rel="noopener noreferrer">${trial.pmid}</a></div>` : ''}
          </div>
        </div>
        <div class="detail-item">
          <span class="detail-label">QC Team Assignment</span>
          <div class="text-xs mt-1">
            <div>Extractor: <strong>${trial.extractor || 'Unknown'}</strong></div>
            <div>Verifier: <strong>${trial.checker || 'Unassigned'}</strong></div>
            <div>Status: <span class="badge ${trial.qcStatus === 'Verified' ? 'badge-success' : 'badge-warning'}">${trial.qcStatus}</span></div>
          </div>
        </div>
      </div>
      ${trial.citation ? `
        <div class="detail-item mb-2">
          <span class="detail-label">Citation</span>
          <div class="text-xs text-muted mt-1 font-mono">${trial.citation}</div>
        </div>
      ` : ''}
      ${trial.qcNotes ? `
        <div class="alert alert-important text-xs">
          <strong>Quality Control Audit Notes:</strong> ${trial.qcNotes}
        </div>
      ` : ''}
    `;

    modalBackdrop.classList.remove('d-none');
  }

  closeDetailModal() {
    const modalBackdrop = document.getElementById('viewDetailModalBackdrop');
    if (modalBackdrop) modalBackdrop.classList.add('d-none');
  }
}

// Global instance
window.trialTable = new TrialTableController();

// Modal close button handlers
document.addEventListener('DOMContentLoaded', () => {
  const btnClose = document.getElementById('btnCloseDetailModal');
  const btnCloseBtn = document.getElementById('btnCloseDetailModalBtn');
  if (btnClose) btnClose.addEventListener('click', () => window.trialTable.closeDetailModal());
  if (btnCloseBtn) btnCloseBtn.addEventListener('click', () => window.trialTable.closeDetailModal());
});
