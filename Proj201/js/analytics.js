/**
 * PROJ 201: Comparative Analytics & Visualization
 * Mustafaoglu Lab · Sabancı University · Fall 2026
 */

class AnalyticsController {
  constructor() {
    this.charts = {};
    window.addEventListener('proj201:datachange', () => {
      this.render();
    });
  }

  render() {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded, skipping chart rendering.');
      return;
    }
    this.renderOutcomesByDisease();
    this.renderFailureReasons();
    this.renderContributingFactors();
    this.renderPhaseDistribution();
  }

  getTrials() {
    return window.storage.getTrials();
  }

  // Chart 1: Outcomes Breakdown by Disease
  renderOutcomesByDisease() {
    const canvas = document.getElementById('outcomesByDiseaseChart');
    if (!canvas) return;

    const trials = this.getTrials();
    const diseases = ["Alzheimer's Disease", "Glioblastoma", "Stroke"];
    const outcomes = ['Positive outcome', 'Negative outcome', 'Mixed / Inconclusive', 'Terminated / Discontinued'];

    const datasets = outcomes.map((outcome, idx) => {
      const colors = ['#10b981', '#ef4444', '#f59e0b', '#1e293b'];
      const counts = diseases.map(dis => {
        return trials.filter(t => t.disease === dis && t.outcomeClass === outcome).length;
      });

      return {
        label: outcome,
        data: counts,
        backgroundColor: colors[idx % colors.length]
      };
    });

    if (this.charts.outcomes) {
      this.charts.outcomes.destroy();
    }

    this.charts.outcomes = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Alzheimer\'s (Group A)', 'Glioblastoma (Group B)', 'Stroke (Group C)'],
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 10, font: { size: 10, family: 'Plus Jakarta Sans' } } }
        },
        scales: {
          x: { stacked: true, ticks: { font: { size: 11 } } },
          y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } } }
        }
      }
    });
  }

  // Chart 2: Documented Failure Reasons
  renderFailureReasons() {
    const canvas = document.getElementById('failureReasonsChart');
    if (!canvas) return;

    const trials = this.getTrials().filter(t => t.outcomeClass !== 'Positive outcome');
    const reasonsMap = {};

    trials.forEach(t => {
      const cat = t.failureCategory || 'Other / Not reported';
      reasonsMap[cat] = (reasonsMap[cat] || 0) + 1;
    });

    const labels = Object.keys(reasonsMap);
    const data = Object.values(reasonsMap);

    if (this.charts.reasons) {
      this.charts.reasons.destroy();
    }

    this.charts.reasons = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels.length > 0 ? labels : ['No negative outcomes in dataset'],
        datasets: [{
          data: data.length > 0 ? data : [1],
          backgroundColor: [
            '#ef4444', // Lack of Efficacy
            '#f97316', // Safety / AEs
            '#8b5cf6', // Futility
            '#06b6d4', // Accrual
            '#64748b'  // Other
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } }
        }
      }
    });
  }

  // Chart 3: BBB Delivery & Translational Factors
  renderContributingFactors() {
    const canvas = document.getElementById('contributingFactorsChart');
    if (!canvas) return;

    const trials = this.getTrials();
    const factorCounts = {
      'BBB Delivery Limitation': 0,
      'Disease Heterogeneity / Escape': 0,
      'Target Engagement / Mechanism Toxicity': 0,
      'Therapeutic Window / Late Timing': 0,
      'Rodent-Human Translation Mismatch': 0
    };

    trials.forEach(t => {
      const text = ((t.contribFactors || '') + ' ' + (t.bbbFactor || '')).toLowerCase();
      if (text.includes('bbb') || text.includes('blood-brain barrier') || text.includes('penetration')) {
        factorCounts['BBB Delivery Limitation']++;
      }
      if (text.includes('heterogeneity') || text.includes('escape') || text.includes('clonal')) {
        factorCounts['Disease Heterogeneity / Escape']++;
      }
      if (text.includes('target') || text.includes('toxicity') || text.includes('notch') || text.includes('off-target')) {
        factorCounts['Target Engagement / Mechanism Toxicity']++;
      }
      if (text.includes('window') || text.includes('late') || text.includes('timing') || text.includes('early')) {
        factorCounts['Therapeutic Window / Late Timing']++;
      }
      if (text.includes('rodent') || text.includes('preclinical') || text.includes('mcao') || text.includes('translation')) {
        factorCounts['Rodent-Human Translation Mismatch']++;
      }
    });

    if (this.charts.factors) {
      this.charts.factors.destroy();
    }

    this.charts.factors = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: Object.keys(factorCounts),
        datasets: [{
          label: 'Studies Citing Factor',
          data: Object.values(factorCounts),
          backgroundColor: '#0284c7'
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } } },
          y: { ticks: { font: { size: 10 } } }
        }
      }
    });
  }

  // Chart 4: Phase Distribution
  renderPhaseDistribution() {
    const canvas = document.getElementById('phaseDistributionChart');
    if (!canvas) return;

    const trials = this.getTrials();
    const phase2 = trials.filter(t => t.phase === 'Phase 2').length;
    const phase3 = trials.filter(t => t.phase === 'Phase 3').length;
    const phase23 = trials.filter(t => t.phase === 'Phase 2/3').length;

    if (this.charts.phase) {
      this.charts.phase.destroy();
    }

    this.charts.phase = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: ['Phase II', 'Phase III', 'Phase II/III'],
        datasets: [{
          data: [phase2, phase3, phase23],
          backgroundColor: ['#6366f1', '#0047ba', '#38bdf8']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } }
        }
      }
    });
  }
}

// Global instance
window.analytics = new AnalyticsController();
