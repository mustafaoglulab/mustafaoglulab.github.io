/**
 * PROJ 201: Comparative Analytics & Visualization (07_ANALYSIS)
 * Renders the 6 Target Figures, BBB Passage Analysis & Comparisons across Diseases
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
    this.renderBbbByApproachChart();
    this.renderBbbByDiseaseChart();
    this.renderBbbMatrixTable();
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
          legend: { position: 'top', labels: { boxWidth: 12, font: { size: 10, family: 'Plus Jakarta Sans' } } },
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
          legend: { position: 'top', labels: { boxWidth: 12, font: { size: 10, family: 'Plus Jakarta Sans' } } }
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

  // Figure 5: BBB Delivery Hurdle by Therapeutic Modality (Grouped Bar)
  renderBbbByApproachChart() {
    const canvas = document.getElementById('chartBbbByApproach');
    if (!canvas) return;

    const trials = this.getTrials();
    const approaches = ["Small molecule", "Antibody", "Biologic", "Cell therapy", "Other"];

    const countsYes = approaches.map(app => trials.filter(t => t.therapeuticApproach === app && t.factorBbb === 'Yes').length);
    const countsNo = approaches.map(app => trials.filter(t => t.therapeuticApproach === app && t.factorBbb === 'No').length);
    const countsUnclear = approaches.map(app => trials.filter(t => t.therapeuticApproach === app && (t.factorBbb === 'Unclear' || !t.factorBbb)).length);

    if (this.charts.bbbApproach) {
      this.charts.bbbApproach.destroy();
    }

    this.charts.bbbApproach = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: approaches,
        datasets: [
          {
            label: 'BBB Hurdle (Yes)',
            data: countsYes,
            backgroundColor: '#e11d48',
            borderRadius: 3
          },
          {
            label: 'Adequate / Not Limiting (No)',
            data: countsNo,
            backgroundColor: '#059669',
            borderRadius: 3
          },
          {
            label: 'Unclear / Not Reported',
            data: countsUnclear,
            backgroundColor: '#94a3b8',
            borderRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 10, font: { size: 10, family: 'Plus Jakarta Sans' } } },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }
        }
      }
    });
  }

  // Figure 6: BBB Delivery Hurdle Breakdown across Diseases by Modality (Stacked Bar)
  renderBbbByDiseaseChart() {
    const canvas = document.getElementById('chartBbbByDisease');
    if (!canvas) return;

    const trials = this.getTrials();
    const diseases = ["Alzheimer's", "GBM", "Stroke"];
    const approaches = ["Small molecule", "Antibody", "Biologic", "Cell therapy", "Other"];
    const appColors = {
      "Small molecule": '#0284c7',
      "Antibody": '#7c3aed',
      "Biologic": '#ea580c',
      "Cell therapy": '#10b981',
      "Other": '#64748b'
    };

    const datasets = approaches.map(app => ({
      label: app,
      data: diseases.map(dis => trials.filter(t => t.disease === dis && t.therapeuticApproach === app && t.factorBbb === 'Yes').length),
      backgroundColor: appColors[app],
      borderRadius: 4
    }));

    if (this.charts.bbbDisease) {
      this.charts.bbbDisease.destroy();
    }

    this.charts.bbbDisease = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: diseases,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 10, font: { size: 10, family: 'Plus Jakarta Sans' } } },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }
        }
      }
    });
  }

  // Cross-Tabulation Matrix: BBB Delivery Analysis Table
  renderBbbMatrixTable() {
    const tbody = document.getElementById('bodyBbbMatrix');
    if (!tbody) return;

    const trials = this.getTrials();
    const modalities = [
      {
        name: 'Small molecule',
        mechanism: 'Passive diffusion governed by lipophilicity (logP) and MW (<400–500 Da). Active luminal efflux by P-gp (ABCB1) and BCRP (ABCG2) expels diverse chemical scaffolds; polar/hydrophilic drugs (e.g. NXY-059) fail parenchymal uptake.'
      },
      {
        name: 'Antibody',
        mechanism: 'Large macromolecular size (~150 kDa) blocked by intact brain endothelial tight junctions (zonula occludens). Steady-state CSF/plasma ratio is typically <0.1–0.2% without engineered receptor-mediated transcytosis (e.g. TfR or LRP1 shuttles).'
      },
      {
        name: 'Biologic',
        mechanism: 'Peptides and proteins lack passive permeability and face rapid systemic proteolytic degradation (e.g., plasmin cleavage). Cell-penetrating sequences (Tat) facilitate passage but remain vulnerable to plasma inactivation.'
      },
      {
        name: 'Cell therapy',
        mechanism: 'Intact non-fenestrated brain endothelia prevent physiological extravasation of cells; systemic infusions face high first-pass entrapment within pulmonary capillary beds.'
      },
      {
        name: 'Other',
        mechanism: 'Gene vectors and nanoparticle formulations require surface targeting ligands, endosomal escape machinery, and strategies to evade perivascular microglial phagocytosis.'
      }
    ];

    const calcStats = (app, dis) => {
      let filtered = trials.filter(t => t.therapeuticApproach === app);
      if (dis !== 'ALL') {
        filtered = filtered.filter(t => t.disease === dis);
      }
      const total = filtered.length;
      const bbbYes = filtered.filter(t => t.factorBbb === 'Yes').length;
      return { total, bbbYes, pct: total > 0 ? Math.round((bbbYes / total) * 100) : null };
    };

    let totalAdAll = 0, yesAdAll = 0;
    let totalGbmAll = 0, yesGbmAll = 0;
    let totalStrokeAll = 0, yesStrokeAll = 0;
    let totalCombAll = 0, yesCombAll = 0;

    const rowsHtml = modalities.map(m => {
      const ad = calcStats(m.name, "Alzheimer's");
      const gbm = calcStats(m.name, 'GBM');
      const stroke = calcStats(m.name, 'Stroke');
      const comb = calcStats(m.name, 'ALL');

      totalAdAll += ad.total; yesAdAll += ad.bbbYes;
      totalGbmAll += gbm.total; yesGbmAll += gbm.bbbYes;
      totalStrokeAll += stroke.total; yesStrokeAll += stroke.bbbYes;
      totalCombAll += comb.total; yesCombAll += comb.bbbYes;

      const formatCell = (stat) => {
        if (stat.total === 0) return '<span class="text-muted text-xs">—</span>';
        const isHigh = stat.pct >= 50;
        return `
          <div class="font-mono text-sm ${isHigh ? 'text-danger font-bold' : ''}">
            ${stat.bbbYes}/${stat.total} <span class="text-xs text-muted">(${stat.pct}%)</span>
          </div>
        `;
      };

      return `
        <tr>
          <td>
            <strong>${m.name}</strong>
          </td>
          <td class="text-center">${formatCell(ad)}</td>
          <td class="text-center">${formatCell(gbm)}</td>
          <td class="text-center">${formatCell(stroke)}</td>
          <td class="text-center font-bold" style="background: var(--bg-subtle);">${formatCell(comb)}</td>
          <td class="text-xs text-muted" style="line-height: 1.45;">
            ${m.mechanism}
          </td>
        </tr>
      `;
    }).join('');

    // Summary Total Row
    const adPct = totalAdAll > 0 ? Math.round((yesAdAll / totalAdAll) * 100) : 0;
    const gbmPct = totalGbmAll > 0 ? Math.round((yesGbmAll / totalGbmAll) * 100) : 0;
    const strokePct = totalStrokeAll > 0 ? Math.round((yesStrokeAll / totalStrokeAll) * 100) : 0;
    const combPct = totalCombAll > 0 ? Math.round((yesCombAll / totalCombAll) * 100) : 0;

    const totalRow = `
      <tr style="background: var(--primary-light); font-weight: bold; border-top: 2px solid var(--border);">
        <td><strong class="text-primary">ALL MODALITIES COMBINED</strong></td>
        <td class="text-center font-mono text-primary">${yesAdAll}/${totalAdAll} <span class="text-xs">(${adPct}%)</span></td>
        <td class="text-center font-mono text-primary">${yesGbmAll}/${totalGbmAll} <span class="text-xs">(${gbmPct}%)</span></td>
        <td class="text-center font-mono text-primary">${yesStrokeAll}/${totalStrokeAll} <span class="text-xs">(${strokePct}%)</span></td>
        <td class="text-center font-mono text-primary font-bold" style="background: #e0e7ff;">${yesCombAll}/${totalCombAll} <span class="text-xs">(${combPct}%)</span></td>
        <td class="text-xs text-primary">Cross-disease incidence of documented BBB delivery failure hurdles across all therapeutic modalities</td>
      </tr>
    `;

    tbody.innerHTML = rowsHtml + totalRow;
  }
}

// Global instance
window.analytics = new AnalyticsController();
