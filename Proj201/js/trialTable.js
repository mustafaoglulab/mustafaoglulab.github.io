/**
 * PROJ 201: Clinical Trial Table Controller
 * Powers 03_ALZHEIMERS, 04_GBM, 05_STROKE, and 06_COMBINED_DATA
 * Mustafaoglu Lab · Sabancı University · Fall 2026
 */

class TrialTableController {
  constructor() {
    this.searchFilters = {
      ad: '',
      gbm: '',
      stroke: '',
      combined: ''
    };
    this.outcomeFilters = {
      ad: 'ALL',
      gbm: 'ALL',
      stroke: 'ALL',
      combined: 'ALL'
    };
    this.combinedDiseaseFilter = 'ALL';

    this.initEventListeners();
  }

  initEventListeners() {
    // Search inputs
    const bindSearch = (id, key) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          this.searchFilters[key] = e.target.value.trim().toLowerCase();
          this.render();
        });
      }
    };
    bindSearch('searchAd', 'ad');
    bindSearch('searchGbm', 'gbm');
    bindSearch('searchStroke', 'stroke');
    bindSearch('searchCombined', 'combined');

    // Outcome filter selects
    const bindOutcome = (id, key) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', (e) => {
          this.outcomeFilters[key] = e.target.value;
          this.render();
        });
      }
    };
    bindOutcome('filterOutcomeAd', 'ad');
    bindOutcome('filterOutcomeGbm', 'gbm');
    bindOutcome('filterOutcomeStroke', 'stroke');
    bindOutcome('filterOutcomeCombined', 'combined');

    // Combined disease filter
    const elCombDis = document.getElementById('filterDiseaseCombined');
    if (elCombDis) {
      elCombDis.addEventListener('change', (e) => {
        this.combinedDiseaseFilter = e.target.value;
        this.render();
      });
    }

    // Modal detail close
    const btnClose = document.getElementById('btnCloseDetailModal');
    const btnCloseBtn = document.getElementById('btnCloseDetailModalBtn');
    if (btnClose) btnClose.addEventListener('click', () => this.closeDetailModal());
    if (btnCloseBtn) btnCloseBtn.addEventListener('click', () => this.closeDetailModal());

    window.addEventListener('proj201:datachange', () => {
      this.render();
      this.updateCounts();
    });
  }

  render() {
    this.renderDiseaseTable("Alzheimer's", 'bodyAd', this.searchFilters.ad, this.outcomeFilters.ad);
    this.renderDiseaseTable('GBM', 'bodyGbm', this.searchFilters.gbm, this.outcomeFilters.gbm);
    this.renderDiseaseTable('Stroke', 'bodyStroke', this.searchFilters.stroke, this.outcomeFilters.stroke);
    this.renderCombinedTable();
    this.updateCounts();
  }

  renderDiseaseTable(disease, tbodyId, searchQuery, outcomeFilter) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    let trials = window.storage.getTrials().filter(t => t.disease === disease);

    if (outcomeFilter && outcomeFilter !== 'ALL') {
      trials = trials.filter(t => t.overallOutcome === outcomeFilter);
    }

    if (searchQuery) {
      trials = trials.filter(t => this.matchSearch(t, searchQuery));
    }

    if (trials.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted p-3">No ${disease} clinical trials matching criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = trials.map(t => this.renderTableRow(t, false)).join('');
  }

  renderCombinedTable() {
    const tbody = document.getElementById('bodyCombined');
    if (!tbody) return;

    let trials = window.storage.getTrials();

    if (this.combinedDiseaseFilter && this.combinedDiseaseFilter !== 'ALL') {
      trials = trials.filter(t => t.disease === this.combinedDiseaseFilter);
    }

    if (this.outcomeFilters.combined && this.outcomeFilters.combined !== 'ALL') {
      trials = trials.filter(t => t.overallOutcome === this.outcomeFilters.combined);
    }

    if (this.searchFilters.combined) {
      trials = trials.filter(t => this.matchSearch(t, this.searchFilters.combined));
    }

    if (trials.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted p-3">No clinical trials found in combined dataset.</td></tr>`;
      return;
    }

    tbody.innerHTML = trials.map(t => this.renderTableRow(t, true)).join('');
  }

  matchSearch(t, query) {
    return (
      (t.nctId && t.nctId.toLowerCase().includes(query)) ||
      (t.drugName && t.drugName.toLowerCase().includes(query)) ||
      (t.studyTitle && t.studyTitle.toLowerCase().includes(query)) ||
      (t.mechanism && t.mechanism.toLowerCase().includes(query)) ||
      (t.primaryEndpoint && t.primaryEndpoint.toLowerCase().includes(query)) ||
      (t.extractedBy && t.extractedBy.toLowerCase().includes(query))
    );
  }

  renderTableRow(t, isCombined = false) {
    const outcomeClass = t.overallOutcome === 'Positive' ? 'pill-pos' :
                         t.overallOutcome === 'Negative' ? 'pill-neg' :
                         t.overallOutcome === 'Mixed / Inconclusive' ? 'pill-mix' : 'pill-muted';

    const disClass = t.disease === "Alzheimer's" ? 'pill-ad' :
                     t.disease === "GBM" ? 'pill-gbm' : 'pill-stroke';

    const qcClass = t.verificationStatus === 'Verified' ? 'text-primary font-bold' :
                    t.verificationStatus === 'Needs revision' ? 'text-danger' : 'text-muted';

    return `
      <tr>
        <td>
          <a href="${t.registryUrl || '#'}" target="_blank" rel="noopener noreferrer" class="font-mono text-primary font-bold">
            ${t.nctId}
          </a>
          <div class="text-xs text-muted">${t.completionYear || ''} · ${t.status || ''}</div>
        </td>
        ${isCombined ? `<td><span class="pill ${disClass}">${t.disease}</span></td>` : ''}
        <td>
          <strong>${t.drugName || 'Unnamed'}</strong>
          <span class="pill pill-muted text-xs" style="margin-left: 4px;">${t.therapeuticApproach || ''}</span>
          <div class="text-xs text-muted" style="max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${t.studyTitle}">
            ${t.studyTitle}
          </div>
        </td>
        <td><span class="font-mono text-xs">${t.phase || ''}</span></td>
        <td><span class="pill ${outcomeClass}">${t.overallOutcome || 'Not reported'}</span></td>
        <td>
          <div class="text-xs" style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${t.primaryEndpoint}">
            ${t.primaryEndpoint || ''}
          </div>
          <span class="text-xs font-bold ${t.primaryEndpointResult === 'Met' ? 'text-primary' : 'text-muted'}">Result: ${t.primaryEndpointResult || 'N/A'}</span>
        </td>
        ${!isCombined ? `
          <td>
            <span class="tag-factor ${t.factorBbb === 'Yes' ? 'yes' : ''}">BBB: ${t.factorBbb || '-'}</span>
            <span class="tag-factor ${t.factorSafety === 'Yes' ? 'yes' : ''}">Safe: ${t.factorSafety || '-'}</span>
          </td>
        ` : ''}
        <td>
          <div class="text-xs ${qcClass}">${t.verificationStatus || 'Pending'}</div>
          <div class="text-xs text-muted">${t.verifiedBy ? 'by ' + t.verifiedBy : ''}</div>
        </td>
        <td class="text-right" style="white-space: nowrap;">
          <button class="btn btn-outline btn-sm" onclick="window.trialTable.openDetailModal('${t.id}')">View</button>
          <button class="btn btn-outline btn-sm" onclick="window.trialForm.openEditModal('${t.id}')">Edit</button>
        </td>
      </tr>
    `;
  }

  updateCounts() {
    const trials = window.storage.getTrials();
    const countAd = trials.filter(t => t.disease === "Alzheimer's").length;
    const countGbm = trials.filter(t => t.disease === "GBM").length;
    const countStroke = trials.filter(t => t.disease === "Stroke").length;
    const countCombined = trials.length;

    const elAd = document.getElementById('countTabAd');
    if (elAd) elAd.textContent = countAd;
    const elGbm = document.getElementById('countTabGbm');
    if (elGbm) elGbm.textContent = countGbm;
    const elStroke = document.getElementById('countTabStroke');
    if (elStroke) elStroke.textContent = countStroke;
    const elComb = document.getElementById('countTabCombined');
    if (elComb) elComb.textContent = countCombined;
  }

  openDetailModal(id) {
    const trial = window.storage.getTrialById(id);
    if (!trial) return;

    const modalBackdrop = document.getElementById('viewDetailModalBackdrop');
    const modalTitle = document.getElementById('viewDetailModalTitle');
    const modalBody = document.getElementById('viewDetailModalBody');
    const diseasePill = document.getElementById('detailDiseasePill');
    const outcomePill = document.getElementById('detailOutcomePill');
    const qcPill = document.getElementById('detailQcPill');
    const btnEdit = document.getElementById('btnDetailEdit');

    if (!modalBackdrop || !modalBody) return;

    modalTitle.textContent = `${trial.nctId} · ${trial.drugName}`;

    diseasePill.className = `pill ${trial.disease === "Alzheimer's" ? 'pill-ad' : trial.disease === "GBM" ? 'pill-gbm' : 'pill-stroke'}`;
    diseasePill.textContent = trial.disease;

    outcomePill.className = `pill ${trial.overallOutcome === 'Positive' ? 'pill-pos' : trial.overallOutcome === 'Negative' ? 'pill-neg' : 'pill-mix'}`;
    outcomePill.textContent = trial.overallOutcome;

    qcPill.className = `pill ${trial.verificationStatus === 'Verified' ? 'pill-pos' : 'pill-muted'}`;
    qcPill.textContent = `QC: ${trial.verificationStatus}`;

    if (btnEdit) {
      btnEdit.onclick = () => {
        this.closeDetailModal();
        window.trialForm.openEditModal(trial.id);
      };
    }

    modalBody.innerHTML = `
      <div class="mb-3">
        <h4 style="font-size: 1.05rem;">${trial.studyTitle}</h4>
        <div class="text-sm mt-1">
          <a href="${trial.registryUrl}" target="_blank" rel="noopener noreferrer" class="font-mono text-primary">
            ${trial.nctId} on ClinicalTrials.gov &nearr;
          </a>
          ${trial.publicationUrl ? `· <a href="${trial.publicationUrl}" target="_blank" rel="noopener noreferrer" class="text-muted font-mono">DOI/Paper &nearr;</a>` : ''}
        </div>
      </div>

      <!-- Categories A, B, C, D -->
      <div class="grid-2 mb-3">
        <div class="card p-0">
          <div class="card-header"><strong class="text-sm">A &amp; B. Identification &amp; Treatment</strong></div>
          <div class="card-body text-sm">
            <div><strong>Phase:</strong> ${trial.phase} (${trial.status}, ${trial.completionYear || 'N/A'})</div>
            <div><strong>Drug:</strong> ${trial.drugName} (${trial.therapeuticApproach})</div>
            <div><strong>Mechanism:</strong> ${trial.mechanism}</div>
            <div><strong>Route &amp; Goal:</strong> ${trial.adminRoute} · ${trial.treatmentObjective}</div>
          </div>
        </div>

        <div class="card p-0">
          <div class="card-header"><strong class="text-sm">C &amp; D. Trial Design &amp; Outcome</strong></div>
          <div class="card-body text-sm">
            <div><strong>Design:</strong> ${trial.studyDesign} vs ${trial.controlGroup} (N=${trial.numParticipants || 'N/A'})</div>
            <div><strong>Population:</strong> ${trial.patientPopulation}</div>
            <div><strong>Primary Endpoint:</strong> ${trial.primaryEndpoint} (<strong>${trial.primaryEndpointResult}</strong>)</div>
            <div><strong>FDA Approval:</strong> ${trial.regulatoryApproval}</div>
          </div>
        </div>
      </div>

      <!-- Reported Clinical Findings -->
      <div class="card p-0 mb-3">
        <div class="card-header"><strong class="text-sm">Reported Clinical Findings &amp; Safety</strong></div>
        <div class="card-body text-sm">
          <div><strong>Clinical Benefit Evidence:</strong> ${trial.clinicalBenefitEvidence || 'None reported'}</div>
          <div class="mt-1 text-danger"><strong>Safety Concerns:</strong> ${trial.safetyConcerns || 'None reported'}</div>
          ${trial.reportedFailureReason ? `<div class="mt-1"><strong>Documented Reason for Failure:</strong> ${trial.reportedFailureReason}</div>` : ''}
          ${trial.terminationReason && trial.terminationReason !== 'Not applicable' ? `<div class="mt-1 text-danger"><strong>Termination Reason:</strong> ${trial.terminationReason}</div>` : ''}
        </div>
      </div>

      <!-- Category E Factors -->
      <div class="card p-0 mb-3">
        <div class="card-header"><strong class="text-sm">E. Factors Influencing Success or Failure (Yes / No / Unclear)</strong></div>
        <div class="card-body text-sm">
          <div class="factor-grid-minimal mb-2">
            <div class="factor-item">Efficacy Issue: <strong>${trial.factorEfficacy}</strong></div>
            <div class="factor-item">Safety/Toxicity: <strong>${trial.factorSafety}</strong></div>
            <div class="factor-item">BBB Delivery: <strong>${trial.factorBbb}</strong></div>
            <div class="factor-item">Heterogeneity: <strong>${trial.factorHeterogeneity}</strong></div>
            <div class="factor-item">Patient Selection: <strong>${trial.factorSelection}</strong></div>
            <div class="factor-item">Trial Design: <strong>${trial.factorDesign}</strong></div>
            <div class="factor-item">Operational: <strong>${trial.factorOperational}</strong></div>
          </div>
          ${trial.supportingEvidence ? `<div class="text-xs text-muted"><strong>Supporting Evidence:</strong> ${trial.supportingEvidence}</div>` : ''}
        </div>
      </div>

      <!-- Category F Scientific Interpretation -->
      <div class="card p-0 mb-3">
        <div class="card-header"><strong class="text-sm">F. Scientific Interpretation &amp; Lessons</strong></div>
        <div class="card-body text-sm">
          <div><strong>Main Finding:</strong> ${trial.mainFinding || 'N/A'}</div>
          <div class="mt-1"><strong>Why Did It Succeed or Fail?:</strong> ${trial.whySucceedOrFail || 'N/A'}</div>
          <div class="mt-1 text-primary"><strong>Lessons for Future Trials:</strong> ${trial.futureLessons || 'N/A'}</div>
          ${trial.limitations ? `<div class="mt-1 text-muted"><strong>Limitations:</strong> ${trial.limitations}</div>` : ''}
        </div>
      </div>

      <!-- Category G Teamwork -->
      <div class="card p-0">
        <div class="card-header"><strong class="text-sm">G. Data Quality &amp; Teamwork</strong></div>
        <div class="card-body text-sm">
          <div>Extracted by: <strong>${trial.extractedBy}</strong> · Verified by: <strong>${trial.verifiedBy}</strong> (Status: <strong>${trial.verificationStatus}</strong>)</div>
          ${trial.comments ? `<div class="mt-1 text-xs text-muted">Notes: ${trial.comments}</div>` : ''}
        </div>
      </div>
    `;

    modalBackdrop.classList.remove('d-none');
  }

  closeDetailModal() {
    const modalBackdrop = document.getElementById('viewDetailModalBackdrop');
    if (modalBackdrop) modalBackdrop.classList.add('d-none');
  }
}

// Global singleton
window.trialTable = new TrialTableController();
