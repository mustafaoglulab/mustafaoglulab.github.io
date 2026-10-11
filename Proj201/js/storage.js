/**
 * PROJ 201: Storage Management & Data Export/Import
 * Mustafaoglu Lab · Sabancı University · Fall 2026
 */

class StorageManager {
  constructor() {
    this.STORAGE_KEY = 'proj201_research_database_v1';
    this.USER_KEY = 'proj201_active_user_v1';
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

  // Trials CRUD
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

    const index = data.trials.findIndex(t => t.id === trial.id || t.nctId.toUpperCase() === trial.nctId.toUpperCase());
    trial.updatedAt = new Date().toISOString();

    if (index >= 0) {
      data.trials[index] = { ...data.trials[index], ...trial };
    } else {
      if (!trial.id) trial.id = 'trial-' + Date.now();
      data.trials.push(trial);
    }

    this.saveData(data);
    return trial;
  }

  deleteTrial(id) {
    const data = this.getData();
    data.trials = (data.trials || []).filter(t => t.id !== id);
    this.saveData(data);
  }

  // QC Log CRUD
  getQcLog() {
    return this.getData().qcLog || [];
  }

  addQcLogEntry(entry) {
    const data = this.getData();
    if (!data.qcLog) data.qcLog = [];
    if (!entry.id) entry.id = 'qc-' + Date.now();
    if (!entry.date) {
      const now = new Date();
      entry.date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    data.qcLog.unshift(entry);
    this.saveData(data);
    return entry;
  }

  // Weekly Progress & Tasks
  getWeeks() {
    return this.getData().weeks || [];
  }

  updateTaskStatus(weekNumber, taskId, completed) {
    const data = this.getData();
    const week = (data.weeks || []).find(w => w.weekNumber === weekNumber);
    if (week && week.tasks) {
      const task = week.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = completed;
        this.saveData(data);
      }
    }
  }

  getFinalChecklist() {
    return this.getData().finalChecklist || [];
  }

  updateFinalChecklist(id, checked) {
    const data = this.getData();
    const item = (data.finalChecklist || []).find(i => i.id === id);
    if (item) {
      item.checked = checked;
      this.saveData(data);
    }
  }

  getWeeklyProgressReports() {
    return this.getData().weeklyProgress || [];
  }

  addWeeklyProgressReport(report) {
    const data = this.getData();
    if (!data.weeklyProgress) data.weeklyProgress = [];
    if (!report.id) report.id = 'wp-' + Date.now();
    if (!report.submissionDate) report.submissionDate = new Date().toISOString().split('T')[0];
    data.weeklyProgress.unshift(report);
    this.saveData(data);
    return report;
  }

  // Search Logs
  getSearchLogs() {
    return this.getData().searchLogs || [];
  }

  addSearchLog(log) {
    const data = this.getData();
    if (!data.searchLogs) data.searchLogs = [];
    if (!log.id) log.id = 'search-' + Date.now();
    data.searchLogs.unshift(log);
    this.saveData(data);
    return log;
  }

  // User Profile
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
  // EXPORT / IMPORT UTILITIES
  // ==========================================

  exportAsJSON() {
    const data = this.getData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `PROJ201_Clinical_Trials_Backup_${dateStr}.json`;
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

    const headers = [
      'NCT ID',
      'Disease',
      'Study Title',
      'Phase',
      'Randomization',
      'Blinding',
      'Comparator',
      'Status',
      'Start Date',
      'Completion Date',
      'Enrollment',
      'Disease Stage / Subtype',
      'Eligibility Criteria',
      'Drug Name',
      'Mechanism / Class',
      'Molecular Target',
      'Route',
      'Dosing Regimen',
      'Primary Endpoint',
      'Secondary Endpoints',
      'Outcome Classification',
      'Primary Outcome Detail',
      'Reported Efficacy',
      'Reported Safety',
      'Documented Reason for Failure',
      'Failure Category',
      'BBB Delivery Factor',
      'Possible Contributing Factors',
      'Registry Link',
      'DOI',
      'PMID',
      'Citation',
      'Extractor',
      'Verifier / Checker',
      'QC Status',
      'QC Notes'
    ];

    const escapeCsv = (val) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = trials.map(t => [
      escapeCsv(t.nctId),
      escapeCsv(t.disease),
      escapeCsv(t.title),
      escapeCsv(t.phase),
      escapeCsv(t.randomization),
      escapeCsv(t.blinding),
      escapeCsv(t.comparator),
      escapeCsv(t.status),
      escapeCsv(t.startDate),
      escapeCsv(t.completionDate),
      escapeCsv(t.enrollment),
      escapeCsv(t.diseaseStage),
      escapeCsv(t.eligibility),
      escapeCsv(t.drugName),
      escapeCsv(t.mechanism),
      escapeCsv(t.molecularTarget),
      escapeCsv(t.adminRoute),
      escapeCsv(t.dosingRegimen),
      escapeCsv(t.primaryEndpoint),
      escapeCsv(t.secondaryEndpoints),
      escapeCsv(t.outcomeClass),
      escapeCsv(t.primaryOutcomeDetail),
      escapeCsv(t.efficacySummary),
      escapeCsv(t.safetySummary),
      escapeCsv(t.docReason),
      escapeCsv(t.failureCategory),
      escapeCsv(t.bbbFactor),
      escapeCsv(t.contribFactors),
      escapeCsv(t.registryUrl),
      escapeCsv(t.doi),
      escapeCsv(t.pmid),
      escapeCsv(t.citation),
      escapeCsv(t.extractor),
      escapeCsv(t.checker),
      escapeCsv(t.qcStatus),
      escapeCsv(t.qcNotes)
    ].join(','));

    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const diseaseNameSafe = (diseaseFilter === 'ALL' ? 'Combined_Database' : diseaseFilter.replace(/\s+/g, '_'));

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
        // Merge mode
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

        // Merge search logs and QC logs if available
        if (parsed.qcLog && Array.isArray(parsed.qcLog)) {
          parsed.qcLog.forEach(incomingQc => {
            if (!currentData.qcLog.some(q => q.id === incomingQc.id)) {
              currentData.qcLog.push(incomingQc);
            }
          });
        }

        if (parsed.searchLogs && Array.isArray(parsed.searchLogs)) {
          parsed.searchLogs.forEach(incomingSl => {
            if (!currentData.searchLogs.some(s => s.id === incomingSl.id)) {
              currentData.searchLogs.push(incomingSl);
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
