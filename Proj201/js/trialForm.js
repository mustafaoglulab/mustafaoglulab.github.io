/**
 * PROJ 201: Clinical Trial Form Controller (Add & Edit)
 * Conforms to Standard Categories A–G Schema and Two-Stage Entry Workflow
 * Mustafaoglu Lab · Sabancı University · Fall 2026
 */

class TrialFormController {
  constructor() {
    this.modalBackdrop = document.getElementById('trialModalBackdrop');
    this.modalTitle = document.getElementById('trialModalTitle');
    this.form = document.getElementById('trialForm');
    this.currentStage = 'stage-essential';
    this.stages = ['stage-essential', 'stage-advanced', 'stage-team'];

    this.initEventListeners();
  }

  initEventListeners() {
    // Stage navigation tabs
    const btnStageEssential = document.getElementById('tabBtnStageEssential');
    const btnStageAdvanced = document.getElementById('tabBtnStageAdvanced');
    const btnStageTeam = document.getElementById('tabBtnStageTeam');

    if (btnStageEssential) btnStageEssential.addEventListener('click', () => this.setStage('stage-essential'));
    if (btnStageAdvanced) btnStageAdvanced.addEventListener('click', () => this.setStage('stage-advanced'));
    if (btnStageTeam) btnStageTeam.addEventListener('click', () => this.setStage('stage-team'));

    // Toggle button in modal footer
    const btnToggleStage = document.getElementById('btnToggleStage');
    if (btnToggleStage) {
      btnToggleStage.addEventListener('click', () => {
        const currIndex = this.stages.indexOf(this.currentStage);
        const nextIndex = (currIndex + 1) % this.stages.length;
        this.setStage(this.stages[nextIndex]);
      });
    }

    // Modal close buttons
    const btnClose = document.getElementById('btnCloseTrialModal');
    const btnCancel = document.getElementById('btnCancelTrialModal');
    if (btnClose) btnClose.addEventListener('click', () => this.closeModal());
    if (btnCancel) btnCancel.addEventListener('click', () => this.closeModal());

    // NCT ID formatting and registry link helper
    const nctInput = document.getElementById('formNctId');
    const regUrlInput = document.getElementById('formRegistryUrl');
    if (nctInput) {
      nctInput.addEventListener('input', (e) => {
        let val = e.target.value.trim().toUpperCase();
        nctInput.value = val;
        if (regUrlInput && (!regUrlInput.value || regUrlInput.value.includes('clinicaltrials.gov'))) {
          if (val.startsWith('NCT') && val.length === 11) {
            regUrlInput.value = `https://clinicaltrials.gov/study/${val}`;
          }
        }
      });
    }

    // Form submission
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveForm();
      });
    }
  }

  setStage(stageId) {
    this.currentStage = stageId;

    // Update Stage Tab active classes
    const tabs = [
      { id: 'tabBtnStageEssential', stage: 'stage-essential' },
      { id: 'tabBtnStageAdvanced', stage: 'stage-advanced' },
      { id: 'tabBtnStageTeam', stage: 'stage-team' }
    ];

    tabs.forEach(t => {
      const el = document.getElementById(t.id);
      if (el) {
        if (t.stage === stageId) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    });

    // Show/hide content panels
    this.stages.forEach(st => {
      const panel = document.getElementById(st);
      if (panel) {
        if (st === stageId) {
          panel.classList.remove('d-none');
          panel.classList.add('active');
        } else {
          panel.classList.add('d-none');
          panel.classList.remove('active');
        }
      }
    });

    // Update toggle button text
    const btnToggle = document.getElementById('btnToggleStage');
    if (btnToggle) {
      if (stageId === 'stage-essential') {
        btnToggle.innerHTML = 'Next: Factors &amp; Interpretation &rarr;';
      } else if (stageId === 'stage-advanced') {
        btnToggle.innerHTML = 'Next: Teamwork &amp; QC &rarr;';
      } else {
        btnToggle.innerHTML = '&larr; Back to Essential Data';
      }
    }
  }

  openNewModal(disease = null) {
    if (!this.form) return;
    this.form.reset();
    document.getElementById('formTrialId').value = '';
    this.modalTitle.textContent = 'Add Clinical Trial Record';

    const activeProfile = window.storage.getActiveUserProfile();

    // Auto-select disease
    const diseaseSelect = document.getElementById('formDisease');
    if (diseaseSelect) {
      if (disease) {
        diseaseSelect.value = disease;
      } else if (activeProfile.diseaseScope && activeProfile.diseaseScope !== 'ALL') {
        diseaseSelect.value = activeProfile.diseaseScope;
      }
    }

    // Determine default extractor and partner reviewer
    const extractedInput = document.getElementById('formExtractedBy');
    const verifiedInput = document.getElementById('formVerifiedBy');
    if (extractedInput) extractedInput.value = activeProfile.name || 'Student';

    if (verifiedInput) {
      const partnerMap = {
        'Student A1': 'Student A2',
        'Student A2': 'Student A1',
        'Student B1': 'Student B2',
        'Student B2': 'Student B1',
        'Student C1': 'Student C2',
        'Student C2': 'Student C1'
      };
      verifiedInput.value = partnerMap[activeProfile.name] || 'Teammate';
    }

    const qcStatusSelect = document.getElementById('formVerificationStatus');
    if (qcStatusSelect) qcStatusSelect.value = 'Pending';

    // Defaults for Factor dropdowns
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    setVal('factorEfficacy', 'Yes');
    setVal('factorSafety', 'No');
    setVal('factorBbb', 'Unclear');
    setVal('factorHeterogeneity', 'No');
    setVal('factorSelection', 'No');
    setVal('factorDesign', 'No');
    setVal('factorOperational', 'No');

    this.setStage('stage-essential');
    this.modalBackdrop.classList.remove('d-none');
  }

  openEditModal(trialId) {
    const trial = window.storage.getTrialById(trialId);
    if (!trial) return;

    this.form.reset();
    document.getElementById('formTrialId').value = trial.id;
    this.modalTitle.textContent = `Edit Clinical Trial: ${trial.nctId}`;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = (val !== undefined && val !== null) ? val : '';
    };

    // Category A. Trial identification
    setVal('formNctId', trial.nctId);
    setVal('formDisease', trial.disease || "Alzheimer's");
    setVal('formPhase', trial.phase || 'Phase III');
    setVal('formStudyTitle', trial.studyTitle);
    setVal('formRegistryUrl', trial.registryUrl);
    setVal('formPublicationUrl', trial.publicationUrl);
    setVal('formStatus', trial.status || 'Completed');
    setVal('formCompletionYear', trial.completionYear);

    // Category B. Treatment information
    setVal('formDrugName', trial.drugName);
    setVal('formApproach', trial.therapeuticApproach || 'Small molecule');
    setVal('formAdminRoute', trial.adminRoute || 'Oral');
    setVal('formMechanism', trial.mechanism);
    setVal('formTreatmentObjective', trial.treatmentObjective || 'Disease-modifying');

    // Category C. Clinical trial design
    setVal('formNumParticipants', trial.numParticipants);
    setVal('formStudyDesign', trial.studyDesign || 'Randomized');
    setVal('formControlGroup', trial.controlGroup || 'Placebo');
    setVal('formPatientPopulation', trial.patientPopulation);
    setVal('formPrimaryEndpoint', trial.primaryEndpoint);
    setVal('formPrimaryEndpointResult', trial.primaryEndpointResult || 'Met');

    // Category D. Clinical outcome
    setVal('formOverallOutcome', trial.overallOutcome || 'Negative');
    setVal('formRegulatoryApproval', trial.regulatoryApproval || 'No');
    setVal('formClinicalBenefitEvidence', trial.clinicalBenefitEvidence);
    setVal('formSafetyConcerns', trial.safetyConcerns);
    setVal('formReportedFailureReason', trial.reportedFailureReason);
    setVal('formTerminationReason', trial.terminationReason);

    // Category E. Factors potentially influencing success or failure
    setVal('factorEfficacy', trial.factorEfficacy || 'No');
    setVal('factorSafety', trial.factorSafety || 'No');
    setVal('factorBbb', trial.factorBbb || 'No');
    setVal('factorHeterogeneity', trial.factorHeterogeneity || 'No');
    setVal('factorSelection', trial.factorSelection || 'No');
    setVal('factorDesign', trial.factorDesign || 'No');
    setVal('factorOperational', trial.factorOperational || 'No');
    setVal('formSupportingEvidence', trial.supportingEvidence);

    // Category F. Scientific interpretation
    setVal('formMainFinding', trial.mainFinding);
    setVal('formWhySucceedOrFail', trial.whySucceedOrFail);
    setVal('formFutureLessons', trial.futureLessons);
    setVal('formLimitations', trial.limitations);

    // Category G. Data quality and teamwork
    setVal('formExtractedBy', trial.extractedBy);
    setVal('formVerifiedBy', trial.verifiedBy);
    setVal('formVerificationStatus', trial.verificationStatus || 'Pending');
    setVal('formComments', trial.comments);

    this.setStage('stage-essential');
    this.modalBackdrop.classList.remove('d-none');
  }

  closeModal() {
    if (this.modalBackdrop) this.modalBackdrop.classList.add('d-none');
  }

  saveForm() {
    const trialId = document.getElementById('formTrialId').value;
    const nctId = document.getElementById('formNctId').value.trim();

    if (!nctId.match(/^NCT[0-9]{8}$/i)) {
      alert('Please provide a valid ClinicalTrials.gov identifier (e.g. NCT01234567).');
      this.setStage('stage-essential');
      document.getElementById('formNctId').focus();
      return;
    }

    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    const trialData = {
      id: trialId || ('trial-' + Date.now()),
      // A. Trial identification
      nctId: nctId.toUpperCase(),
      disease: getVal('formDisease'),
      phase: getVal('formPhase'),
      studyTitle: getVal('formStudyTitle'),
      registryUrl: getVal('formRegistryUrl') || `https://clinicaltrials.gov/study/${nctId.toUpperCase()}`,
      publicationUrl: getVal('formPublicationUrl'),
      status: getVal('formStatus'),
      completionYear: getVal('formCompletionYear'),

      // B. Treatment information
      drugName: getVal('formDrugName'),
      therapeuticApproach: getVal('formApproach'),
      adminRoute: getVal('formAdminRoute'),
      mechanism: getVal('formMechanism'),
      treatmentObjective: getVal('formTreatmentObjective'),

      // C. Clinical trial design
      numParticipants: parseInt(getVal('formNumParticipants'), 10) || null,
      studyDesign: getVal('formStudyDesign'),
      controlGroup: getVal('formControlGroup'),
      patientPopulation: getVal('formPatientPopulation'),
      primaryEndpoint: getVal('formPrimaryEndpoint'),
      primaryEndpointResult: getVal('formPrimaryEndpointResult'),

      // D. Clinical outcome
      overallOutcome: getVal('formOverallOutcome'),
      regulatoryApproval: getVal('formRegulatoryApproval'),
      clinicalBenefitEvidence: getVal('formClinicalBenefitEvidence'),
      safetyConcerns: getVal('formSafetyConcerns'),
      reportedFailureReason: getVal('formReportedFailureReason'),
      terminationReason: getVal('formTerminationReason'),

      // E. Factors potentially influencing success or failure
      factorEfficacy: getVal('factorEfficacy') || 'No',
      factorSafety: getVal('factorSafety') || 'No',
      factorBbb: getVal('factorBbb') || 'No',
      factorHeterogeneity: getVal('factorHeterogeneity') || 'No',
      factorSelection: getVal('factorSelection') || 'No',
      factorDesign: getVal('factorDesign') || 'No',
      factorOperational: getVal('factorOperational') || 'No',
      supportingEvidence: getVal('formSupportingEvidence'),

      // F. Scientific interpretation
      mainFinding: getVal('formMainFinding'),
      whySucceedOrFail: getVal('formWhySucceedOrFail'),
      futureLessons: getVal('formFutureLessons'),
      limitations: getVal('formLimitations'),

      // G. Data quality and teamwork
      extractedBy: getVal('formExtractedBy'),
      verifiedBy: getVal('formVerifiedBy'),
      verificationStatus: getVal('formVerificationStatus') || 'Pending',
      comments: getVal('formComments'),
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    window.storage.saveTrial(trialData);
    this.closeModal();

    if (window.app && window.app.showToast) {
      window.app.showToast(`Trial ${trialData.nctId} (${trialData.drugName}) saved!`, 'success');
    }
  }
}

// Global instance
window.trialForm = new TrialFormController();
