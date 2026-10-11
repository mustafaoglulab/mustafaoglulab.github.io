/**
 * PROJ 201: Comparative Analytics & Visualization (07_ANALYSIS)
 * Renders the 6 Target Figures & Comparisons across Diseases
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

    this.renderDiseasePhaseChart();
    this.renderOutcomeDistChart();
    this.renderApproachDistChart();
    this.renderFailureFactorsChart();
  }

  getTrials() {
    return (window.storage && window.storage.getTrials) ? window.storage.getTrials() : [];
  }

  // Figure 1: Number of Trials by Disease and Phase (Stacked Bar)
  renderDiseasePhaseChart() {
    const canvas = document.getElementById('chartDiseasePhase');
    if (!canvas) return;

    const trials = this.getTrials();
    const diseases = ["Alzheimer's", "GBM", "Stroke"];
    const phases = ["Phase I", "Phase I–II", "Phase II", "Phase II–III", "Phase III", "Phase IV"];
    const colors = ['#8b5cf6', '#a78bfa', '#6366f1', '#3b82f6', '#0047ba', '#0284c7'];

    const datasets = phases.map((phase, idx) => ({
      label: phase,
      data: diseases.map(dis => trials.filter(t => t.disease === dis && t.phase === phase).length),
      backgroundColor: colors[idx],
      borderRadius: 4
    }));

    if (this.charts.diseasePhase) {
      this.charts.diseasePhase.destroy();
    }

    this.charts.diseasePhase = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: diseases,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11, family: 'Plus Jakarta Sans' } } },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }
        }
      }
    });
  }

  // Figure 2: Distribution of Clinical Outcomes (Doughnut)
  renderOutcomeDistChart() {
    const canvas = document.getElementById('chartOutcomeDist');
    if (!canvas) return;

    const trials = this.getTrials();
    const outcomes = ['Positive', 'Negative', 'Mixed / Inconclusive', 'Not assessable'];
    const counts = outcomes.map(out => trials.filter(t => t.overallOutcome === out).length);
    const colors = ['#059669', '#e11d48', '#d97706', '#64748b'];

    if (this.charts.outcomeDist) {
      this.charts.outcomeDist.destroy();
    }

    this.charts.outcomeDist = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: outcomes,
        datasets: [{
          data: counts.some(c => c > 0) ? counts : [0, 0, 0, 1],
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11, family: 'Plus Jakarta Sans' } } },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = trials.length || 1;
                const val = ctx.raw || 0;
                const pct = Math.round((val / total) * 100);
                return ` ${ctx.label}: ${val} (${pct}%)`;
              }
            }
          }
        },
        cutout: '62%'
      }
    });
  }

  // Figure 3: Comparison of Therapeutic Approaches Across Diseases (Grouped Bar)
  renderApproachDistChart() {
    const canvas = document.getElementById('chartApproachDist');
    if (!canvas) return;

    const trials = this.getTrials();
    const approaches = ["Small molecule", "Antibody", "Biologic", "Cell therapy", "Other"];
    const diseases = ["Alzheimer's", "GBM", "Stroke"];
    const disColors = {
      "Alzheimer's": '#7c3aed',
      "GBM": '#e11d48',
      "Stroke": '#ea580c'
    };

    const datasets = diseases.map(dis => ({
      label: dis,
      data: approaches.map(app => trials.filter(t => t.disease === dis && t.therapeuticApproach === app).length),
      backgroundColor: disColors[dis],
      borderRadius: 3
    }));

    if (this.charts.approachDist) {
      this.charts.approachDist.destroy();
    }

    this.charts.approachDist = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: approaches,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11, family: 'Plus Jakarta Sans' } } }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }
        }
      }
    });
  }

  // Figure 4: Frequency of Documented Failure Factors (Category E Horizontal Bar)
  renderFailureFactorsChart() {
    const canvas = document.getElementById('chartFailureFactors');
    if (!canvas) return;

    const trials = this.getTrials();
    const factors = [
      { key: 'factorEfficacy', label: 'Lack of Efficacy' },
      { key: 'factorSafety', label: 'Safety / Toxicity' },
      { key: 'factorBbb', label: 'BBB / Delivery Hurdle' },
      { key: 'factorHeterogeneity', label: 'Disease Heterogeneity' },
      { key: 'factorSelection', label: 'Patient Selection Issue' },
      { key: 'factorDesign', label: 'Trial Design / Endpoints' },
      { key: 'factorOperational', label: 'Operational / Recruitment' }
    ];

    const counts = factors.map(f => {
      return trials.filter(t => t[f.key] === 'Yes').length;
    });

    if (this.charts.failureFactors) {
      this.charts.failureFactors.destroy();
    }

    this.charts.failureFactors = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: factors.map(f => f.label),
        datasets: [{
          label: 'Studies Documenting Factor (Yes)',
          data: counts,
          backgroundColor: '#0047ba',
          borderRadius: 4
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
          x: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
      }
    });
  }
}

// Global instance
window.analytics = new AnalyticsController();
