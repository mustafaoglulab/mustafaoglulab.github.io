/**
 * PROJ 201: Clinical Trial Form Controller (Add & Edit)
 * Mustafaoglu Lab · Sabancı University · Fall 2026
 */

class TrialFormController {
  constructor() {
    this.modalBackdrop = document.getElementById('trialModalBackdrop');
    this.modalTitle = document.getElementById('trialModalTitle');
    this.form = document.getElementById('trialForm');
    this.currentSectionIndex = 0;
    this.sectionIds = [
      'form-sec-ident',
      'form-sec-patient',
      'form-sec-outcomes',
      'form-sec-reasons',
      'form-sec-evidence'
    ];

    this.initEventListeners();
  }

  initEventListeners() {
    // Form navigation tabs
    const sectionTabs = document.querySelectorAll('.form-section-tab');
    sectionTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        this.goToSection(index);
      });
    });

    // Prev / Next buttons
    const btnPrev = document.getElementById('btnFormPrev');
    const btnNext = document.getElementById('btnFormNext');

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (this.currentSectionIndex > 0) {
          this.goToSection(this.currentSectionIndex - 1);
        }
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (this.currentSectionIndex < this.sectionIds.length - 1) {
          this.goToSection(this.currentSectionIndex + 1);
        }
      });
    }

    // Modal close buttons
    const btnClose = document.getElementById('btnCloseTrialModal');
    const btnCancel = document.getElementById('btnCancelTrialModal');
    if (btnClose) btnClose.addEventListener('click', () => this.closeModal());
    if (btnCancel) btnCancel.addEventListener('click', () => this.closeModal());

    // NCT ID input helper: uppercase formatting + auto-fill Registry URL
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

  goToSection(index) {
    this.currentSectionIndex = index;
    const tabs = document.querySelectorAll('.form-section-tab');
    const sections = document.querySelectorAll('.form-section');

    tabs.forEach((tab, i) => {
      if (i === index) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    sections.forEach((sec, i) => {
      if (i === index) {
        sec.classList.remove('d-none');
        sec.classList.add('active');
      } else {
        sec.classList.add('d-none');
        sec.classList.remove('active');
      }
    });

    // Update buttons
    const btnPrev = document.getElementById('btnFormPrev');
    const btnNext = document.getElementById('btnFormNext');
    if (btnPrev) btnPrev.disabled = (index === 0);
    if (btnNext) btnNext.disabled = (index === this.sectionIds.length - 1);
  }

  openNewModal() {
    this.form.reset();
    document.getElementById('formTrialId').value = '';
    this.modalTitle.textContent = 'Add New Clinical Trial Record';

    // Auto-set extractor to active user profile
    const activeProfile = window.storage.getActiveUserProfile();
    const extractorSelect = document.getElementById('formExtractor');
    if (extractorSelect) {
      for (let i = 0; i < extractorSelect.options.length; i++) {
        if (extractorSelect.options[i].text.includes(activeProfile.name)) {
          extractorSelect.selectedIndex = i;
          break;
        }
      }
    }

    // Auto-select disease based on active group
    const diseaseSelect = document.getElementById('formDisease');
    if (diseaseSelect && activeProfile.diseaseScope && activeProfile.diseaseScope !== 'ALL') {
      diseaseSelect.value = activeProfile.diseaseScope;
    }

    document.getElementById('formQcStatus').value = 'Pending Verification';

    this.goToSection(0);
    this.modalBackdrop.classList.remove('d-none');
  }

  openEditModal(trialId) {
    const trial = window.storage.getTrialById(trialId);
    if (!trial) return;

    this.form.reset();
    document.getElementById('formTrialId').value = trial.id;
    this.modalTitle.textContent = `Edit Clinical Trial: ${trial.nctId}`;

    // Populate Section 1
    document.getElementById('formNctId').value = trial.nctId || '';
    document.getElementById('formDisease').value = trial.disease || '';
    document.getElementById('formPhase').value = trial.phase || '';
    document.getElementById('formTitle').value = trial.title || '';
    document.getElementById('formRandomization').value = trial.randomization || 'Randomized';
    document.getElementById('formBlinding').value = trial.blinding || 'Double-blind';
    document.getElementById('formComparator').value = trial.comparator || '';
    document.getElementById('formStatus').value = trial.status || 'Completed';
    document.getElementById('formStartDate').value = trial.startDate || '';
    document.getElementById('formCompletionDate').value = trial.completionDate || '';

    // Populate Section 2
    document.getElementById('formEnrollment').value = trial.enrollment || '';
    document.getElementById('formDiseaseStage').value = trial.diseaseStage || '';
    document.getElementById('formEligibility').value = trial.eligibility || '';
    document.getElementById('formDrugName').value = trial.drugName || '';
    document.getElementById('formMechanism').value = trial.mechanism || '';
    document.getElementById('formTarget').value = trial.molecularTarget || '';
    document.getElementById('formAdminRoute').value = trial.adminRoute || 'Intravenous (IV) infusion';
    document.getElementById('formDosingRegimen').value = trial.dosingRegimen || '';

    // Populate Section 3
    document.getElementById('formPrimaryEndpoint').value = trial.primaryEndpoint || '';
    document.getElementById('formSecondaryEndpoints').value = trial.secondaryEndpoints || '';
    document.getElementById('formOutcomeClass').value = trial.outcomeClass || '';
    document.getElementById('formPrimaryOutcomeDetail').value = trial.primaryOutcomeDetail || '';
    document.getElementById('formEfficacySummary').value = trial.efficacySummary || '';
    document.getElementById('formSafetySummary').value = trial.safetySummary || '';

    // Populate Section 4
    document.getElementById('formDocReason').value = trial.docReason || '';
    document.getElementById('formFailureCategory').value = trial.failureCategory || 'Not applicable (Positive)';
    document.getElementById('formBbbFactor').value = trial.bbbFactor || 'Not reported / Unknown';
    document.getElementById('formContribFactors').value = trial.contribFactors || '';

    // Populate Section 5
    document.getElementById('formRegistryUrl').value = trial.registryUrl || '';
    document.getElementById('formDoi').value = trial.doi || '';
    document.getElementById('formPmid').value = trial.pmid || '';
    document.getElementById('formCitation').value = trial.citation || '';
    document.getElementById('formExtractor').value = trial.extractor || 'Student A1';
    document.getElementById('formChecker').value = trial.checker || 'Student A2';
    document.getElementById('formQcStatus').value = trial.qcStatus || 'Pending Verification';
    document.getElementById('formQcNotes').value = trial.qcNotes || '';

    this.goToSection(0);
    this.modalBackdrop.classList.remove('d-none');
  }

  closeModal() {
    if (this.modalBackdrop) this.modalBackdrop.classList.add('d-none');
  }

  saveForm() {
    const trialId = document.getElementById('formTrialId').value;
    const nctId = document.getElementById('formNctId').value.trim();

    if (!nctId.match(/^NCT[0-9]{8}$/i)) {
      alert('Please provide a valid ClinicalTrials.gov NCT identifier (e.g. NCT01234567).');
      this.goToSection(0);
      return;
    }

    const trialData = {
      id: trialId || ('trial-' + Date.now()),
      nctId: nctId.toUpperCase(),
      disease: document.getElementById('formDisease').value,
      phase: document.getElementById('formPhase').value,
      title: document.getElementById('formTitle').value.trim(),
      randomization: document.getElementById('formRandomization').value,
      blinding: document.getElementById('formBlinding').value,
      comparator: document.getElementById('formComparator').value.trim(),
      status: document.getElementById('formStatus').value,
      startDate: document.getElementById('formStartDate').value.trim(),
      completionDate: document.getElementById('formCompletionDate').value.trim(),
      enrollment: parseInt(document.getElementById('formEnrollment').value, 10) || null,
      diseaseStage: document.getElementById('formDiseaseStage').value.trim(),
      eligibility: document.getElementById('formEligibility').value.trim(),
      drugName: document.getElementById('formDrugName').value.trim(),
      mechanism: document.getElementById('formMechanism').value.trim(),
      molecularTarget: document.getElementById('formTarget').value.trim(),
      adminRoute: document.getElementById('formAdminRoute').value,
      dosingRegimen: document.getElementById('formDosingRegimen').value.trim(),
      primaryEndpoint: document.getElementById('formPrimaryEndpoint').value.trim(),
      secondaryEndpoints: document.getElementById('formSecondaryEndpoints').value.trim(),
      outcomeClass: document.getElementById('formOutcomeClass').value,
      primaryOutcomeDetail: document.getElementById('formPrimaryOutcomeDetail').value.trim(),
      efficacySummary: document.getElementById('formEfficacySummary').value.trim(),
      safetySummary: document.getElementById('formSafetySummary').value.trim(),
      docReason: document.getElementById('formDocReason').value.trim(),
      failureCategory: document.getElementById('formFailureCategory').value,
      bbbFactor: document.getElementById('formBbbFactor').value,
      contribFactors: document.getElementById('formContribFactors').value.trim(),
      registryUrl: document.getElementById('formRegistryUrl').value.trim(),
      doi: document.getElementById('formDoi').value.trim(),
      pmid: document.getElementById('formPmid').value.trim(),
      citation: document.getElementById('formCitation').value.trim(),
      extractor: document.getElementById('formExtractor').value,
      checker: document.getElementById('formChecker').value,
      qcStatus: document.getElementById('formQcStatus').value,
      qcNotes: document.getElementById('formQcNotes').value.trim()
    };

    window.storage.saveTrial(trialData);
    this.closeModal();

    window.app.showToast(`Trial ${trialData.nctId} saved successfully!`, 'success');
  }
}

// Global instance
window.trialForm = new TrialFormController();
