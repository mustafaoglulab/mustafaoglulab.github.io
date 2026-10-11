/**
 * PROJ 201: Storage Management & Data Export/Import
 * Conforms to Standard Column Schema (Categories A–G)
 * Mustafaoglu Lab · Sabancı University · Fall 2026
 */

class StorageManager {
  constructor() {
    this.STORAGE_KEY = 'proj201_research_database_v2';
    this.USER_KEY = 'proj201_active_user_v2';
    this.init();
  }

  init() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.resetToSeedData();
    }
  }

  // Load all app data
  getData() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(SEED_DATA));
      return JSON.parse(raw);
    } catch (err) {
      console.error('Failed to parse storage data:', err);
      return JSON.parse(JSON.stringify(SEED_DATA));
    }
  }

  // Save full state
  saveData(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      this.notifyUpdate();
      return true;
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
      return false;
    }
  }

  // Reset to default benchmark seed dataset
  resetToSeedData() {
    const clone = JSON.parse(JSON.stringify(SEED_DATA));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clone));
    this.notifyUpdate();
    return clone;
  }

  // ==========================================
  // TRIALS CRUD (Categories A–G)
  // ==========================================
  getTrials() {
    return this.getData().trials || [];
  }

  getTrialById(id) {
    const trials = this.getTrials();
    return trials.find(t => t.id === id);
  }

  saveTrial(trial) {
    const data = this.getData();
    if (!data.trials) data.trials = [];

    const index = data.trials.findIndex(t => t.id === trial.id || (t.nctId && t.nctId.toUpperCase() === trial.nctId.toUpperCase()));
    trial.lastUpdated = new Date().toISOString().split('T')[0];

    if (index >= 0) {
      data.trials[index] = { ...data.trials[index], ...trial };
    } else {
      if (!trial.id) trial.id = 'trial-' + Date.now();
      data.trials.push(trial);
    }

    this.saveData(data);
    if (window.cloudSync) window.cloudSync.syncTrial(trial);
    return trial;
  }

  deleteTrial(id) {
    const data = this.getData();
    data.trials = (data.trials || []).filter(t => t.id !== id);
    this.saveData(data);
    if (window.cloudSync) window.cloudSync.deleteTrial(id);
  }

  // ==========================================
  // SEARCH MATRIX & SEARCH LOGS (02_SEARCH_LOG)
  // ==========================================
  getSearchMatrix() {
    return this.getData().searchMatrix || (SEED_DATA.searchMatrix || []);
  }

  updateSearchMatrix(matrix) {
    const data = this.getData();
    data.searchMatrix = matrix;
    this.saveData(data);
    if (window.cloudSync) window.cloudSync.syncSearchMatrix(matrix);
  }

  getSearchLogs() {
    return this.getData().searchLogs || [];
  }

  addSearchLog(log) {
    const data = this.getData();
    if (!data.searchLogs) data.searchLogs = [];
    if (!log.id) log.id = 'search-' + Date.now();
    data.searchLogs.unshift(log);
    this.saveData(data);
    if (window.cloudSync) window.cloudSync.syncSearchLog(log);
    return log;
  }

  // ==========================================
  // WEEKLY PROGRESS (08_WEEKLY_PROGRESS)
  // 1 row per student per week
  // ==========================================
  getWeeklyProgress() {
    return this.getData().weeklyProgress || [];
  }

  addWeeklyProgressRow(row) {
    const data = this.getData();
    if (!data.weeklyProgress) data.weeklyProgress = [];
    if (!row.id) row.id = 'wp-' + Date.now();
    data.weeklyProgress.unshift(row);
    this.saveData(data);
    if (window.cloudSync) window.cloudSync.syncWeeklyProgress(row);
    return row;
  }

  // ==========================================
  // USER PROFILES
  // ==========================================
  getActiveUser() {
    const saved = localStorage.getItem(this.USER_KEY);
    return saved || 'student_a1';
  }

  setActiveUser(userId) {
    localStorage.setItem(this.USER_KEY, userId);
  }

  getActiveUserProfile() {
    const userId = this.getActiveUser();
    return USER_PROFILES[userId] || USER_PROFILES.student_a1;
  }

  // Event dispatcher for UI reactivity
  notifyUpdate() {
    window.dispatchEvent(new CustomEvent('proj201:datachange'));
  }

  // ==========================================
  // EXPORT / IMPORT (Exact Columns A–G)
  // ==========================================
  exportAsJSON() {
    const data = this.getData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `PROJ201_Database_Backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  exportAsCSV(diseaseFilter = 'ALL') {
    let trials = this.getTrials();
    if (diseaseFilter && diseaseFilter !== 'ALL') {
      trials = trials.filter(t => t.disease === diseaseFilter);
    }

    if (trials.length === 0) {
      alert('No clinical trials to export.');
      return;
    }

    // Exact Column Headings matching Dr. Nur's specification A through G
    const headers = [
      // A. Trial identification
      'NCT ID',
      'Study Title',
      'Disease',
      'ClinicalTrials.gov Link',
      'Publication Link / DOI',
      'Trial Phase',
      'Study Status',
      'Completion Year',
      // B. Treatment information
      'Drug / Treatment Name',
      'Therapeutic Approach',
      'Molecular Target / Mechanism',
      'Administration Route',
      'Treatment Objective',
      // C. Clinical trial design
      'Number of Participants',
      'Patient Population',
      'Study Design',
      'Control Group',
      'Primary Endpoint',
      'Primary Endpoint Result',
      // D. Clinical outcome
      'Overall Clinical Outcome',
      'Evidence of Clinical Benefit',
      'Safety Concerns',
      'Regulatory Approval',
      'Reported Reason for Failure',
      'Reason for Early Termination',
      // E. Factors potentially influencing success or failure
      'Lack of Efficacy',
      'Safety / Toxicity',
      'BBB / Brain Drug Delivery',
      'Disease Heterogeneity',
      'Patient Selection',
      'Trial Design / Endpoint Issues',
      'Operational / Recruitment Issues',
      'Supporting Evidence',
      // F. Scientific interpretation
      'Main Finding',
      'Why Did It Succeed or Fail?',
      'Lessons for Future Trials',
      'Limitations / Missing Information',
      // G. Data quality and teamwork
      'Data Extracted By',
      'Data Verified By',
      'Verification Status',
      'Last Updated',
      'Comments'
    ];

    const escapeCsv = (val) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = trials.map(t => [
      // A
      escapeCsv(t.nctId),
      escapeCsv(t.studyTitle),
      escapeCsv(t.disease),
      escapeCsv(t.registryUrl),
      escapeCsv(t.publicationUrl),
      escapeCsv(t.phase),
      escapeCsv(t.status),
      escapeCsv(t.completionYear),
      // B
      escapeCsv(t.drugName),
      escapeCsv(t.therapeuticApproach),
      escapeCsv(t.mechanism),
      escapeCsv(t.adminRoute),
      escapeCsv(t.treatmentObjective),
      // C
      escapeCsv(t.numParticipants),
      escapeCsv(t.patientPopulation),
      escapeCsv(t.studyDesign),
      escapeCsv(t.controlGroup),
      escapeCsv(t.primaryEndpoint),
      escapeCsv(t.primaryEndpointResult),
      // D
      escapeCsv(t.overallOutcome),
      escapeCsv(t.clinicalBenefitEvidence),
      escapeCsv(t.safetyConcerns),
      escapeCsv(t.regulatoryApproval),
      escapeCsv(t.reportedFailureReason),
      escapeCsv(t.terminationReason),
      // E
      escapeCsv(t.factorEfficacy),
      escapeCsv(t.factorSafety),
      escapeCsv(t.factorBbb),
      escapeCsv(t.factorHeterogeneity),
      escapeCsv(t.factorSelection),
      escapeCsv(t.factorDesign),
      escapeCsv(t.factorOperational),
      escapeCsv(t.supportingEvidence),
      // F
      escapeCsv(t.mainFinding),
      escapeCsv(t.whySucceedOrFail),
      escapeCsv(t.futureLessons),
      escapeCsv(t.limitations),
      // G
      escapeCsv(t.extractedBy),
      escapeCsv(t.verifiedBy),
      escapeCsv(t.verificationStatus),
      escapeCsv(t.lastUpdated),
      escapeCsv(t.comments)
    ].join(','));

    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const diseaseNameSafe = (diseaseFilter === 'ALL' ? 'Combined_Data' : diseaseFilter.replace(/\s+/g, '_'));

    const a = document.createElement('a');
    a.href = url;
    a.download = `PROJ201_${diseaseNameSafe}_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importFromJSON(jsonString, mode = 'merge') {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.trials || !Array.isArray(parsed.trials)) {
        throw new Error('Invalid JSON format: missing "trials" array.');
      }

      if (mode === 'replace') {
        this.saveData(parsed);
        return { success: true, count: parsed.trials.length, mode: 'replaced' };
      } else {
        const currentData = this.getData();
        const existingTrials = currentData.trials || [];
        let addedCount = 0;
        let updatedCount = 0;

        parsed.trials.forEach(incoming => {
          const matchIdx = existingTrials.findIndex(
            e => (incoming.id && e.id === incoming.id) || (incoming.nctId && e.nctId.toUpperCase() === incoming.nctId.toUpperCase())
          );
          if (matchIdx >= 0) {
            existingTrials[matchIdx] = { ...existingTrials[matchIdx], ...incoming };
            updatedCount++;
          } else {
            existingTrials.push(incoming);
            addedCount++;
          }
        });

        currentData.trials = existingTrials;

        if (parsed.weeklyProgress && Array.isArray(parsed.weeklyProgress)) {
          parsed.weeklyProgress.forEach(wp => {
            if (!currentData.weeklyProgress.some(w => w.id === wp.id)) {
              currentData.weeklyProgress.push(wp);
            }
          });
        }

        if (parsed.searchLogs && Array.isArray(parsed.searchLogs)) {
          parsed.searchLogs.forEach(sl => {
            if (!currentData.searchLogs.some(s => s.id === sl.id)) {
              currentData.searchLogs.push(sl);
            }
          });
        }

        this.saveData(currentData);
        return { success: true, added: addedCount, updated: updatedCount, mode: 'merged' };
      }
    } catch (err) {
      console.error('Import failed:', err);
      return { success: false, error: err.message };
    }
  }
}

// Global singleton instance
window.storage = new StorageManager();
