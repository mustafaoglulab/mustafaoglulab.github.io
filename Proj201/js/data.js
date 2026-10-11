/**
 * PROJ 201: Why Do Brain Drugs Fail?
 * Standardized Data Schema (Categories A–G) & Initial Benchmark Datasets
 * Mustafaoglu Lab · Sabancı University · Fall 2026
 */

const SEED_DATA = {
  // Clinical Trials Database — All tabs share this identical schema (Categories A–G)
  trials: [
    // --- 03_ALZHEIMERS (Group A) ---
    {
      id: "trial-ad-1",
      // A. Trial identification
      nctId: "NCT02484534",
      studyTitle: "A Study to Confirm Safety and Efficacy of BAN2401 (Lecanemab) in Participants With Early Alzheimer's Disease (Clarity AD)",
      disease: "Alzheimer's",
      registryUrl: "https://clinicaltrials.gov/study/NCT02484534",
      publicationUrl: "https://doi.org/10.1056/NEJMoa2212948",
      phase: "Phase III",
      status: "Completed",
      completionYear: "2022",

      // B. Treatment information
      drugName: "Lecanemab (Leqembi / BAN2401)",
      therapeuticApproach: "Antibody",
      mechanism: "Humanized IgG1 mAb targeting soluble amyloid-beta protofibrils and oligomers",
      adminRoute: "Intravenous",
      treatmentObjective: "Disease-modifying",

      // C. Clinical trial design
      numParticipants: 1795,
      patientPopulation: "Early Alzheimer's Disease (MCI and mild AD with confirmed amyloid pathology)",
      studyDesign: "Randomized",
      controlGroup: "Placebo",
      primaryEndpoint: "Change from baseline in CDR-SB at 18 months",
      primaryEndpointResult: "Met",

      // D. Clinical outcome
      overallOutcome: "Positive",
      clinicalBenefitEvidence: "Statistically significant 27% reduction in clinical decline on CDR-SB at 18 months (-0.45 points, p < 0.001) and substantial amyloid plaque clearance on PET.",
      safetyConcerns: "ARIA-E (brain edema) occurred in 12.6% of patients; ARIA-H (microhemorrhages) occurred in 17.3%. Required serial MRI safety monitoring.",
      regulatoryApproval: "Yes",
      reportedFailureReason: "Not applicable (Trial met primary endpoint)",
      terminationReason: "Not applicable",

      // E. Factors potentially influencing success or failure
      factorEfficacy: "No",
      factorSafety: "Yes",
      factorBbb: "Yes",
      factorHeterogeneity: "No",
      factorSelection: "No",
      factorDesign: "No",
      factorOperational: "No",
      supportingEvidence: "van Dyck CH, et al. N Engl J Med 2023;388:9-21. mAb brain bioavailability ~0.1-0.2% across intact BBB; required bi-weekly high dosing and strict early-stage amyloid confirmation.",

      // F. Scientific interpretation
      mainFinding: "Targeting soluble protofibrils in early amyloid-confirmed AD moderately slows cognitive and functional decline over 18 months.",
      whySucceedOrFail: "Succeeded by selecting biologically verified early-stage patients prior to extensive synaptic loss and specifically targeting soluble neurotoxic protofibrils rather than monomeric peptide.",
      futureLessons: "Biomarker-guided early patient selection and protofibril targeting work, but BBB penetration remains low (<0.2%) and ARIA risk demands careful safety screening.",
      limitations: "Modest clinical effect size; safety risk in ApoE4 homozygotes and anticoagulated patients; high healthcare resource requirements for infusion and MRI.",

      // G. Data quality and teamwork
      extractedBy: "Student A1",
      verifiedBy: "Student A2",
      verificationStatus: "Verified",
      lastUpdated: "2026-10-14",
      comments: "Key positive benchmark trial for Group A (Alzheimer's)."
    },
    {
      id: "trial-ad-2",
      // A. Trial identification
      nctId: "NCT01224106",
      studyTitle: "A Study of Semagacestat (LY450139) in Alzheimer's Disease (IDENTITY)",
      disease: "Alzheimer's",
      registryUrl: "https://clinicaltrials.gov/study/NCT01224106",
      publicationUrl: "https://doi.org/10.1056/NEJMoa1215516",
      phase: "Phase III",
      status: "Terminated",
      completionYear: "2011",

      // B. Treatment information
      drugName: "Semagacestat (LY450139)",
      therapeuticApproach: "Small molecule",
      mechanism: "Non-selective gamma-secretase inhibitor inhibiting amyloid-beta peptide generation",
      adminRoute: "Oral",
      treatmentObjective: "Disease-modifying",

      // C. Clinical trial design
      numParticipants: 1537,
      patientPopulation: "Mild-to-moderate Alzheimer's disease (MMSE 16–26)",
      studyDesign: "Randomized",
      controlGroup: "Placebo",
      primaryEndpoint: "ADAS-Cog11 and ADCS-ADL change at 76 weeks",
      primaryEndpointResult: "Not met",

      // D. Clinical outcome
      overallOutcome: "Negative",
      clinicalBenefitEvidence: "No clinical benefit observed. Semagacestat-treated patients experienced statistically significant, dose-dependent cognitive and functional worsening compared with placebo.",
      safetyConcerns: "Significantly increased rates of non-melanoma skin cancer (squamous cell carcinoma), gastrointestinal toxicity, weight loss, and infections.",
      regulatoryApproval: "No",
      reportedFailureReason: "Terminated early by Data Monitoring Committee due to futility, accelerated cognitive decline, and excess skin cancer incidence.",
      terminationReason: "Adverse cognitive worsening and excess cutaneous malignancy",

      // E. Factors potentially influencing success or failure
      factorEfficacy: "Yes",
      factorSafety: "Yes",
      factorBbb: "No",
      factorHeterogeneity: "No",
      factorSelection: "Yes",
      factorDesign: "No",
      factorOperational: "No",
      supportingEvidence: "Doody RS, et al. N Engl J Med 2013;369:341-350. Small molecule readily penetrated the BBB, but non-selective catalytic inhibition blocked Notch-1 signaling causing epithelial oncogenesis.",

      // F. Scientific interpretation
      mainFinding: "Non-selective gamma-secretase inhibition accelerated cognitive decline and caused significant off-target toxicity including cutaneous neoplasms.",
      whySucceedOrFail: "Failed due to off-target biological toxicity: gamma-secretase cleaves essential substrates including Notch-1, cadherins, and APP intracellular domain, leading to severe physiological disruption.",
      futureLessons: "Adequate brain BBB penetration is insufficient if the enzymatic target lacks substrate selectivity; non-selective secretase inhibitors carry unacceptable systemic hazards.",
      limitations: "Conducted in mild-to-moderate patients without mandatory amyloid PET pre-screening.",

      // G. Data quality and teamwork
      extractedBy: "Student A2",
      verifiedBy: "Student A1",
      verificationStatus: "Verified",
      lastUpdated: "2026-10-15",
      comments: "Classic negative example demonstrating mechanism-based off-target toxicity despite excellent BBB penetration."
    },
    {
      id: "trial-ad-3",
      // A. Trial identification
      nctId: "NCT00676143",
      studyTitle: "A Study of Bapineuzumab in Patients With Mild to Moderate Alzheimer's Disease (ApoE4 Non-Carriers)",
      disease: "Alzheimer's",
      registryUrl: "https://clinicaltrials.gov/study/NCT00676143",
      publicationUrl: "https://doi.org/10.1056/NEJMoa1304559",
      phase: "Phase III",
      status: "Completed",
      completionYear: "2012",

      // B. Treatment information
      drugName: "Bapineuzumab (AAB-001)",
      therapeuticApproach: "Antibody",
      mechanism: "Humanized IgG1 mAb targeting N-terminal residues 1–5 of amyloid-beta",
      adminRoute: "Intravenous",
      treatmentObjective: "Disease-modifying",

      // C. Clinical trial design
      numParticipants: 1396,
      patientPopulation: "Mild-to-moderate Alzheimer's disease (ApoE4 non-carriers)",
      studyDesign: "Randomized",
      controlGroup: "Placebo",
      primaryEndpoint: "ADAS-Cog11 and DAD (Disability Assessment for Dementia) at 78 weeks",
      primaryEndpointResult: "Not met",

      // D. Clinical outcome
      overallOutcome: "Negative",
      clinicalBenefitEvidence: "No significant difference between bapineuzumab and placebo cohorts on cognitive (p=0.64) or functional (p=0.45) primary outcomes.",
      safetyConcerns: "High incidence of vasogenic cerebral edema (ARIA-E), necessitating protocol amendments and dose caps.",
      regulatoryApproval: "No",
      reportedFailureReason: "Trial completed without demonstrating statistically significant improvement in either co-primary outcome.",
      terminationReason: "Not applicable",

      // E. Factors potentially influencing success or failure
      factorEfficacy: "Yes",
      factorSafety: "Yes",
      factorBbb: "Yes",
      factorHeterogeneity: "Yes",
      factorSelection: "Yes",
      factorDesign: "No",
      factorOperational: "No",
      supportingEvidence: "Salloway S, et al. N Engl J Med 2014;370:322-333. Low brain penetration (<0.1%) combined with administration at moderate disease stage where neurodegeneration was already irreversible.",

      // F. Scientific interpretation
      mainFinding: "N-terminal amyloid antibody cleared modest brain fibril burden but completely failed to halt cognitive deterioration in mild-to-moderate AD.",
      whySucceedOrFail: "Failed because intervention occurred too late in the disease trajectory and low BBB delivery prevented adequate engagement with neurotoxic oligomeric pools.",
      futureLessons: "Anti-amyloid therapeutics must be tested in prodromal/early disease stages and target soluble neurotoxic conformers rather than mature plaques alone.",
      limitations: "Did not pre-screen with amyloid PET; retrospective analyses suggested up to 20% of clinically diagnosed patients lacked amyloid burden.",

      // G. Data quality and teamwork
      extractedBy: "Student A1",
      verifiedBy: "Student A2",
      verificationStatus: "Pending",
      lastUpdated: "2026-10-15",
      comments: "Needs partner review on ARIA-E subgroup percentages."
    },

    // --- 04_GBM (Group B) ---
    {
      id: "trial-gbm-1",
      // A. Trial identification
      nctId: "NCT02017717",
      studyTitle: "An Investigational Immuno-therapy Study of Nivolumab Compared to Bevacizumab in Patients With Recurrent Glioblastoma (CheckMate 143)",
      disease: "GBM",
      registryUrl: "https://clinicaltrials.gov/study/NCT02017717",
      publicationUrl: "https://doi.org/10.1093/neuonc/noaa106",
      phase: "Phase III",
      status: "Completed",
      completionYear: "2018",

      // B. Treatment information
      drugName: "Nivolumab (Opdivo)",
      therapeuticApproach: "Antibody",
      mechanism: "Anti-PD-1 human IgG4 monoclonal antibody blocking immune checkpoint inhibition",
      adminRoute: "Intravenous",
      treatmentObjective: "Disease-modifying",

      // C. Clinical trial design
      numParticipants: 369,
      patientPopulation: "First recurrence of glioblastoma following standard radiation and temozolomide",
      studyDesign: "Randomized",
      controlGroup: "Active comparator",
      primaryEndpoint: "Overall Survival (OS)",
      primaryEndpointResult: "Not met",

      // D. Clinical outcome
      overallOutcome: "Negative",
      clinicalBenefitEvidence: "Median OS was 9.8 months with nivolumab vs 10.0 months with bevacizumab (HR 1.04; 95% CI 0.83–1.30; p = 0.76). No survival advantage.",
      safetyConcerns: "Grade 3–4 treatment-related adverse events occurred in 18.1% of patients (fatigue, rash, elevation in liver transaminases).",
      regulatoryApproval: "No",
      reportedFailureReason: "Trial failed to demonstrate statistically significant improvement in Overall Survival compared with Bevacizumab control.",
      terminationReason: "Not applicable",

      // E. Factors potentially influencing success or failure
      factorEfficacy: "Yes",
      factorSafety: "No",
      factorBbb: "Yes",
      factorHeterogeneity: "Yes",
      factorSelection: "Yes",
      factorDesign: "No",
      factorOperational: "No",
      supportingEvidence: "Reardon DA, et al. Neuro Oncol 2020;22:1672-1683. Intact blood-tumor barrier at non-enhancing margins; profound immunosuppression in GBM microenvironment (macrophages/MDSCs); low tumor mutational burden.",

      // F. Scientific interpretation
      mainFinding: "PD-1 checkpoint inhibition monotherapy failed to prolong survival in recurrent glioblastoma compared to active anti-angiogenic comparator.",
      whySucceedOrFail: "Failed due to the immunologically 'cold' GBM tumor microenvironment, low tumor mutational burden, severe myeloid-driven immunosuppression, and limited antibody penetration across the infiltrative blood-tumor barrier.",
      futureLessons: "Systemic immune checkpoint inhibitors cannot overcome GBM immunosuppression as monotherapy; combination approaches with local BBB disruption or myeloid repolarizers are required.",
      limitations: "Did not pre-select patients based on PD-L1 expression, MGMT methylation, or tumor mutational burden status.",

      // G. Data quality and teamwork
      extractedBy: "Student B1",
      verifiedBy: "Student B2",
      verificationStatus: "Verified",
      lastUpdated: "2026-10-14",
      comments: "Key trial demonstrating challenges of systemic immunotherapy in primary brain tumors."
    },
    {
      id: "trial-gbm-2",
      // A. Trial identification
      nctId: "NCT01480479",
      studyTitle: "A Study of Rindopepimut/GM-CSF in Patients With Newly Diagnosed Glioblastoma (ACT IV)",
      disease: "GBM",
      registryUrl: "https://clinicaltrials.gov/study/NCT01480479",
      publicationUrl: "https://doi.org/10.1016/S1470-2045(17)30517-X",
      phase: "Phase III",
      status: "Terminated",
      completionYear: "2016",

      // B. Treatment information
      drugName: "Rindopepimut (CDX-110)",
      therapeuticApproach: "Biologic",
      mechanism: "Peptide vaccine targeting the tumor-specific EGFRvIII deletion mutation",
      adminRoute: "Other",
      treatmentObjective: "Disease-modifying",

      // C. Clinical trial design
      numParticipants: 745,
      patientPopulation: "Newly diagnosed EGFRvIII-expressing glioblastoma (post-surgical resection and chemoradiation)",
      studyDesign: "Randomized",
      controlGroup: "Placebo",
      primaryEndpoint: "Overall Survival (OS) in minimal residual disease population",
      primaryEndpointResult: "Not met",

      // D. Clinical outcome
      overallOutcome: "Negative",
      clinicalBenefitEvidence: "Despite inducing strong anti-EGFRvIII humoral immune responses, median OS was identical: 20.1 months (rindopepimut) vs 20.0 months (control; HR 1.01; p = 0.93).",
      safetyConcerns: "Well tolerated; mostly low-grade injection-site reactions; no serious neurological autoimmune toxicities.",
      regulatoryApproval: "No",
      reportedFailureReason: "Terminated early based on recommendation of independent Data Safety Monitoring Board for futility (HR 1.01).",
      terminationReason: "Futility at planned interim analysis",

      // E. Factors potentially influencing success or failure
      factorEfficacy: "Yes",
      factorSafety: "No",
      factorBbb: "Unclear",
      factorHeterogeneity: "Yes",
      factorSelection: "No",
      factorDesign: "No",
      factorOperational: "No",
      supportingEvidence: "Weller M, et al. Lancet Oncol 2017;18:1373-1385. Recurrent tumors demonstrated loss of EGFRvIII antigen expression in 57% of patients due to subclonal escape and intratumoral heterogeneity.",

      // F. Scientific interpretation
      mainFinding: "Targeted EGFRvIII peptide vaccine successfully generated anti-tumor antibody titers but failed to improve survival due to subclonal antigen loss.",
      whySucceedOrFail: "Failed because glioblastoma is characterized by extreme clonal heterogeneity; eliminating EGFRvIII-positive cells merely created an evolutionary bottleneck that selected for EGFRvIII-negative resistant clones.",
      futureLessons: "Single-antigen targeted therapies are susceptible to immune escape in heterogeneous brain tumors; multi-epitope vaccines or polyvalent targeting strategies are essential.",
      limitations: "Only assessed newly diagnosed patients with confirmed EGFRvIII mutation at initial surgery.",

      // G. Data quality and teamwork
      extractedBy: "Student B2",
      verifiedBy: "Student B1",
      verificationStatus: "Verified",
      lastUpdated: "2026-10-15",
      comments: "Seminal illustration of clonal heterogeneity defeating targeted therapy in Glioblastoma."
    },
    {
      id: "trial-gbm-3",
      // A. Trial identification
      nctId: "NCT00006353",
      studyTitle: "Radiotherapy With Concomitant and Adjuvant Temozolomide for Glioblastoma (EORTC 26981 / Stupp Protocol)",
      disease: "GBM",
      registryUrl: "https://clinicaltrials.gov/study/NCT00006353",
      publicationUrl: "https://doi.org/10.1056/NEJMoa043330",
      phase: "Phase III",
      status: "Completed",
      completionYear: "2004",

      // B. Treatment information
      drugName: "Temozolomide (Temodar)",
      therapeuticApproach: "Small molecule",
      mechanism: "Alkylating imidazotetrazine prodrug inducing O6-methylguanine DNA cross-links and apoptosis",
      adminRoute: "Oral",
      treatmentObjective: "Disease-modifying",

      // C. Clinical trial design
      numParticipants: 573,
      patientPopulation: "Newly diagnosed, histologically confirmed supratentorial Glioblastoma",
      studyDesign: "Randomized",
      controlGroup: "Standard treatment",
      primaryEndpoint: "Overall Survival (OS)",
      primaryEndpointResult: "Met",

      // D. Clinical outcome
      overallOutcome: "Positive",
      clinicalBenefitEvidence: "Statistically significant prolongation of median OS from 12.1 months (RT alone) to 14.6 months (RT + TMZ; HR 0.63; 95% CI 0.52–0.75; p < 0.001). 2-year survival increased from 10.4% to 26.5%.",
      safetyConcerns: "Myelosuppression (Grade 3–4 thrombocytopenia/leukopenia in 7% during adjuvant phase); manageable nausea and fatigue.",
      regulatoryApproval: "Yes",
      reportedFailureReason: "Not applicable (Trial established global standard of care)",
      terminationReason: "Not applicable",

      // E. Factors potentially influencing success or failure
      factorEfficacy: "No",
      factorSafety: "No",
      factorBbb: "No",
      factorHeterogeneity: "Yes",
      factorSelection: "Yes",
      factorDesign: "No",
      factorOperational: "No",
      supportingEvidence: "Stupp R, et al. N Engl J Med 2005;352:987-996. Small lipophilic molecule (194 Da) with 100% oral bioavailability and 20–30% CSF/plasma ratio; MGMT promoter methylation strongly predictive of benefit.",

      // F. Scientific interpretation
      mainFinding: "Concomitant and adjuvant temozolomide with radiotherapy produced significant, durable survival benefits, establishing the international standard of care.",
      whySucceedOrFail: "Succeeded due to favorable CNS pharmacokinetics (small, non-ionized, crosses blood-tumor barrier) and synergistic DNA radiosensitization, particularly in tumors with epigenetic MGMT silencing.",
      futureLessons: "Adequate brain tissue penetration paired with biomarker stratification (MGMT methylation) is the cornerstone of clinical efficacy in neuro-oncology.",
      limitations: "Conducted prior to 2010 window; included as foundational historical benchmark as authorized in Handbook Section 4.2.",

      // G. Data quality and teamwork
      extractedBy: "Student B1",
      verifiedBy: "Student B2",
      verificationStatus: "Verified",
      lastUpdated: "2026-10-15",
      comments: "Benchmark comparison standard for Glioblastoma."
    },

    // --- 05_STROKE (Group C) ---
    {
      id: "trial-stroke-1",
      // A. Trial identification
      nctId: "NCT00064324",
      studyTitle: "Efficacy and Safety of NXY-059 in Patients With Acute Ischemic Stroke (SAINT II)",
      disease: "Stroke",
      registryUrl: "https://clinicaltrials.gov/study/NCT00064324",
      publicationUrl: "https://doi.org/10.1056/NEJMoa070638",
      phase: "Phase III",
      status: "Completed",
      completionYear: "2006",

      // B. Treatment information
      drugName: "NXY-059 (Cerovive)",
      therapeuticApproach: "Small molecule",
      mechanism: "Free radical spin-trapping neuroprotectant (disodium 2,4-disulfophenyl-N-tert-butylnitrone)",
      adminRoute: "Intravenous",
      treatmentObjective: "Neuroprotective",

      // C. Clinical trial design
      numParticipants: 3195,
      patientPopulation: "Acute Ischemic Stroke presenting within 6 hours of symptom onset",
      studyDesign: "Randomized",
      controlGroup: "Placebo",
      primaryEndpoint: "Modified Rankin Scale (mRS) disability score distribution at 90 days",
      primaryEndpointResult: "Not met",

      // D. Clinical outcome
      overallOutcome: "Negative",
      clinicalBenefitEvidence: "No statistically significant difference in 90-day mRS disability distribution vs placebo (odds ratio 0.94; 95% CI 0.83–1.06; p = 0.33).",
      safetyConcerns: "Adverse event rates comparable to placebo; no excess intracranial hemorrhage or systemic toxicity.",
      regulatoryApproval: "No",
      reportedFailureReason: "Completed trial concluded with unequivocal failure to meet the primary efficacy endpoint on mRS.",
      terminationReason: "Not applicable",

      // E. Factors potentially influencing success or failure
      factorEfficacy: "Yes",
      factorSafety: "No",
      factorBbb: "Yes",
      factorHeterogeneity: "Yes",
      factorSelection: "Yes",
      factorDesign: "Yes",
      factorOperational: "No",
      supportingEvidence: "Shuaib A, et al. N Engl J Med 2007;357:562-571. Highly polar disulfonate molecule with virtually zero penetration across intact BBB; rodent MCAO models had publication bias and lacked reperfusion realism.",

      // F. Scientific interpretation
      mainFinding: "Free radical scavenger NXY-059 was completely ineffective for acute ischemic stroke and failed to replicate early SAINT I findings.",
      whySucceedOrFail: "Failed because the molecule is highly polar and hydrophilic, preventing parenchymal BBB penetration to reach intracellular free radicals; preclinical rodent stroke experiments suffered from methodological bias.",
      futureLessons: "Neuroprotectants must cross the BBB into penumbral parenchyma and must be tested in clinically realistic models (including aged animals with comorbidities and reperfusion).",
      limitations: "6-hour treatment window was likely too wide for neuroprotection in the absence of documented vessel recanalization.",

      // G. Data quality and teamwork
      extractedBy: "Student C1",
      verifiedBy: "Student C2",
      verificationStatus: "Verified",
      lastUpdated: "2026-10-14",
      comments: "The benchmark case study for preclinical translation failure in neuroprotection."
    },
    {
      id: "trial-stroke-2",
      // A. Trial identification
      nctId: "NCT02809833",
      studyTitle: "Efficacy and Safety of Nerinetide for the Treatment of Acute Ischaemic Stroke (ESCAPE-NA1)",
      disease: "Stroke",
      registryUrl: "https://clinicaltrials.gov/study/NCT02809833",
      publicationUrl: "https://doi.org/10.1016/S0140-6736(20)30258-0",
      phase: "Phase III",
      status: "Completed",
      completionYear: "2019",

      // B. Treatment information
      drugName: "Nerinetide (NA-1 / Tat-NR2B9c)",
      therapeuticApproach: "Biologic",
      mechanism: "Cell-permeant peptide disrupting PSD-95 coupling to NMDA receptors, uncoupling excitotoxicity",
      adminRoute: "Intravenous",
      treatmentObjective: "Neuroprotective",

      // C. Clinical trial design
      numParticipants: 1105,
      patientPopulation: "Acute Ischemic Stroke with large vessel occlusion undergoing endovascular thrombectomy (EVT)",
      studyDesign: "Randomized",
      controlGroup: "Placebo",
      primaryEndpoint: "Proportion of participants with favorable functional outcome (mRS 0–2 at 90 days)",
      primaryEndpointResult: "Inconclusive",

      // D. Clinical outcome
      overallOutcome: "Mixed / Inconclusive",
      clinicalBenefitEvidence: "Overall primary endpoint was not met (mRS 0–2: 61.4% nerinetide vs 59.2% placebo, p=0.35). However, in pre-specified patients NOT receiving alteplase, nerinetide significantly improved functional outcome (59.3% vs 49.8%, p=0.03) and halved mortality.",
      safetyConcerns: "Well tolerated; no increase in symptomatic intracranial hemorrhage or hemodynamic instability.",
      regulatoryApproval: "No",
      reportedFailureReason: "Missed primary endpoint in the combined intention-to-treat cohort due to a major proteolytic drug-drug interaction with co-administered alteplase.",
      terminationReason: "Not applicable",

      // E. Factors potentially influencing success or failure
      factorEfficacy: "No",
      factorSafety: "No",
      factorBbb: "No",
      factorHeterogeneity: "Yes",
      factorSelection: "Yes",
      factorDesign: "Yes",
      factorOperational: "No",
      supportingEvidence: "Hill MD, et al. Lancet 2020;395:878-887. Tat carrier peptide crossed the BBB efficiently, but plasmin generated by intravenous alteplase cleaved and inactivated nerinetide in systemic circulation.",

      // F. Scientific interpretation
      mainFinding: "Nerinetide improved stroke outcomes only in patients who did not receive intravenous alteplase, revealing a critical enzymatic drug cleavage interaction.",
      whySucceedOrFail: "Demonstrated biological efficacy when delivered alone with endovascular reperfusion, but failed in the combined cohort because co-administered thrombolytic enzyme proteolytically destroyed the peptide in plasma.",
      futureLessons: "Neuroprotective biologics must be screened for pharmacokinetic interactions with standard thrombolytic reperfusion agents.",
      limitations: "Subgroup benefit was pre-specified but requires replication in an independent trial of thrombectomy without alteplase (ESCAPE-NEXT).",

      // G. Data quality and teamwork
      extractedBy: "Student C2",
      verifiedBy: "Student C1",
      verificationStatus: "Verified",
      lastUpdated: "2026-10-15",
      comments: "Fascinating example of translational pharmacology and drug-drug enzymatic interaction in acute stroke."
    },
    {
      id: "trial-stroke-3",
      // A. Trial identification
      nctId: "NCT00000606",
      studyTitle: "The National Institute of Neurological Disorders and Stroke (NINDS) rt-PA Stroke Study",
      disease: "Stroke",
      registryUrl: "https://clinicaltrials.gov/study/NCT00000606",
      publicationUrl: "https://doi.org/10.1056/NEJM199512143332401",
      phase: "Phase III",
      status: "Completed",
      completionYear: "1995",

      // B. Treatment information
      drugName: "Alteplase (Recombinant Tissue Plasminogen Activator / rt-PA)",
      therapeuticApproach: "Biologic",
      mechanism: "Recombinant serine protease converting plasminogen to plasmin, dissolving intravascular fibrin clots",
      adminRoute: "Intravenous",
      treatmentObjective: "Disease-modifying",

      // C. Clinical trial design
      numParticipants: 624,
      patientPopulation: "Acute Ischemic Stroke treated within 3 hours of symptom onset",
      studyDesign: "Randomized",
      controlGroup: "Placebo",
      primaryEndpoint: "Global favorable outcome at 3 months (mRS 0–1, Barthel Index >= 95, NIHSS <= 1)",
      primaryEndpointResult: "Met",

      // D. Clinical outcome
      overallOutcome: "Positive",
      clinicalBenefitEvidence: "Patients treated with rt-PA were 30% more likely to achieve complete or near-complete neurological recovery at 3 months (OR 1.7; 95% CI 1.2–2.6; p = 0.008).",
      safetyConcerns: "Symptomatic intracranial hemorrhage occurred in 6.4% of rt-PA patients vs 0.6% on placebo (p < 0.001); however, 3-month mortality was not increased (17% vs 21%).",
      regulatoryApproval: "Yes",
      reportedFailureReason: "Not applicable (Established gold standard for acute ischemic stroke reperfusion)",
      terminationReason: "Not applicable",

      // E. Factors potentially influencing success or failure
      factorEfficacy: "No",
      factorSafety: "Yes",
      factorBbb: "No",
      factorHeterogeneity: "Yes",
      factorSelection: "Yes",
      factorDesign: "No",
      factorOperational: "No",
      supportingEvidence: "NINDS rt-PA Stroke Study Group. N Engl J Med 1995;333:1581-1587. Intravascular target (clot) does not require crossing the BBB, but compromised BBB integrity within infarcted tissue mediates hemorrhagic transformation.",

      // F. Scientific interpretation
      mainFinding: "Intravenous thrombolysis within 3 hours significantly increased the odds of disability-free recovery despite an elevated risk of symptomatic hemorrhage.",
      whySucceedOrFail: "Succeeded because rapid arterial recanalization salvages ischemic penumbra; efficacy strictly depended on immediate administration within the tight <3 hour therapeutic window.",
      futureLessons: "Time is brain: acute therapies require rapid triage and imaging; intravascular targets avoid the BBB hurdle but vascular integrity dictates hemorrhagic safety.",
      limitations: "Narrow therapeutic window (expanded later to 4.5h); strict exclusion criteria (bleeding risk, blood pressure, recent surgery).",

      // G. Data quality and teamwork
      extractedBy: "Student C1",
      verifiedBy: "Student C2",
      verificationStatus: "Verified",
      lastUpdated: "2026-10-15",
      comments: "Foundational benchmark comparator for Stroke."
    }
  ],

  // 02_SEARCH_LOG cumulative filter matrix (Handbook Section 6 Week 1)
  searchMatrix: [
    { stepNumber: 1, stepName: "All registered trials", adCount: 3120, gbmCount: 1850, strokeCount: 4200 },
    { stepNumber: 2, stepName: "Interventional studies", adCount: 2240, gbmCount: 1420, strokeCount: 2900 },
    { stepNumber: 3, stepName: "Phase II / III", adCount: 840, gbmCount: 490, strokeCount: 920 },
    { stepNumber: 4, stepName: "Completed / Terminated", adCount: 510, gbmCount: 320, strokeCount: 610 },
    { stepNumber: 5, stepName: "Drug / Biological", adCount: 435, gbmCount: 285, strokeCount: 410 },
    { stepNumber: 6, stepName: "Completion 2010–2026", adCount: 295, gbmCount: 195, strokeCount: 280 },
    { stepNumber: 7, stepName: "Outcomes / Reasons Available", adCount: 180, gbmCount: 125, strokeCount: 160 }
  ],

  // 02_SEARCH_LOG search log entries (exact search terms, dates, filters, URL)
  searchLogs: [
    {
      id: "search-1",
      date: "2026-10-12",
      disease: "Alzheimer's",
      searchTerms: '"Alzheimer Disease" [Condition]',
      filtersApplied: "Interventional | Phase 2, Phase 3 | Completed, Terminated | Drug, Biological | 2010–2026",
      sourceUrl: "https://clinicaltrials.gov/search?cond=Alzheimer+Disease&type=Intr&phase=1&phase=2&stat=c&stat=t&int=drug&int=bio",
      resultsCount: 180,
      student: "Student A1",
      notes: "High number of completed trials do not have posted results on ClinicalTrials.gov; manual PubMed cross-checking required."
    },
    {
      id: "search-2",
      date: "2026-10-13",
      disease: "GBM",
      searchTerms: '"Glioblastoma" OR "GBM" [Condition]',
      filtersApplied: "Interventional | Phase 2, Phase 3 | Completed, Terminated | Drug, Biological | 2010–2026",
      sourceUrl: "https://clinicaltrials.gov/search?cond=Glioblastoma&type=Intr&phase=1&phase=2&stat=c&stat=t&int=drug&int=bio",
      resultsCount: 125,
      student: "Student B1",
      notes: "Need to separate newly diagnosed from recurrent disease during screening."
    },
    {
      id: "search-3",
      date: "2026-10-13",
      disease: "Stroke",
      searchTerms: '"Stroke" OR "Acute Ischemic Stroke" [Condition]',
      filtersApplied: "Interventional | Phase 2, Phase 3 | Completed, Terminated | Drug, Biological | 2010–2026",
      sourceUrl: "https://clinicaltrials.gov/search?cond=Stroke&type=Intr&phase=1&phase=2&stat=c&stat=t&int=drug&int=bio",
      resultsCount: 160,
      student: "Student C1",
      notes: "Excluded physical therapy, rehabilitation, and secondary prevention trials to maintain acute-treatment scope."
    }
  ],

  // 08_WEEKLY_PROGRESS — Exactly 1 row per student per week
  weeklyProgress: [
    {
      id: "wp-1",
      week: 1,
      student: "Student A1",
      group: "Alzheimer's",
      tasksCompleted: "Completed 7-step systematic ClinicalTrials.gov search. Initialized 02_SEARCH_LOG.",
      trialsAddedVerified: "2 identified (Lecanemab, Bapineuzumab)",
      challenges: "Many older trials lack posted results on registry; searched PubMed.",
      nextSteps: "Define inclusion/exclusion criteria for early vs moderate AD."
    },
    {
      id: "wp-2",
      week: 1,
      student: "Student A2",
      group: "Alzheimer's",
      tasksCompleted: "Extracted Semagacestat trial data; verified Lecanemab entry.",
      trialsAddedVerified: "1 extracted (Semagacestat), 1 verified (Lecanemab)",
      challenges: "Interpreting why Semagacestat failed despite lowering amyloid.",
      nextSteps: "Calibrate trial outcome definitions with teammate."
    },
    {
      id: "wp-3",
      week: 1,
      student: "Student B1",
      group: "GBM",
      tasksCompleted: "Completed systematic landscape filtering for Glioblastoma. Documented CheckMate-143.",
      trialsAddedVerified: "2 identified, 1 extracted (Nivolumab)",
      challenges: "Distinguishing pseudoprogression from true tumor progression in clinical endpoints.",
      nextSteps: "Establish criteria to separate newly diagnosed from recurrent GBM."
    },
    {
      id: "wp-4",
      week: 1,
      student: "Student B2",
      group: "GBM",
      tasksCompleted: "Extracted Rindopepimut ACT IV study and verified Nivolumab CheckMate-143.",
      trialsAddedVerified: "1 extracted (Rindopepimut), 1 verified (Nivolumab)",
      challenges: "Investigating reasons for early futility termination in ACT IV.",
      nextSteps: "Identify clinically successful benchmark approach (Temozolomide/TTFields)."
    },
    {
      id: "wp-5",
      week: 1,
      student: "Student C1",
      group: "Stroke",
      tasksCompleted: "Filtered acute ischemic stroke trial landscape. Extracted NXY-059 SAINT II study.",
      trialsAddedVerified: "2 identified, 1 extracted (NXY-059)",
      challenges: "Filtering out non-drug physical therapy trials.",
      nextSteps: "Focus exclusively on acute ischemic stroke treatment windows (<4.5h)."
    },
    {
      id: "wp-6",
      week: 1,
      student: "Student C2",
      group: "Stroke",
      tasksCompleted: "Extracted Nerinetide ESCAPE-NA1 study and verified NXY-059 trial.",
      trialsAddedVerified: "1 extracted (Nerinetide), 1 verified (NXY-059)",
      challenges: "Understanding the drug-drug interaction between nerinetide and alteplase.",
      nextSteps: "Compare neuroprotective agents vs reperfusion therapies."
    }
  ]
};

// Standardized Dropdown Options for Form and Codebook
const DROPDOWN_OPTIONS = {
  disease: ["Alzheimer's", "GBM", "Stroke"],
  phase: ["Phase II", "Phase III", "Phase II–III"],
  status: ["Completed", "Terminated"],
  therapeuticApproach: ["Small molecule", "Antibody", "Biologic", "Cell therapy", "Other"],
  adminRoute: ["Oral", "Intravenous", "Intrathecal", "Intranasal", "Other"],
  treatmentObjective: ["Disease-modifying", "Symptomatic", "Neuroprotective", "Other"],
  studyDesign: ["Randomized", "Non-randomized"],
  controlGroup: ["Placebo", "Standard treatment", "Active comparator", "None"],
  primaryEndpointResult: ["Met", "Not met", "Inconclusive", "Not reported"],
  overallOutcome: ["Positive", "Negative", "Mixed / Inconclusive", "Not assessable"],
  regulatoryApproval: ["Yes", "No", "Not applicable"],
  factors: ["Yes", "No", "Unclear"],
  verificationStatus: ["Pending", "Verified", "Needs revision"]
};

// Profile definitions mapping
const USER_PROFILES = {
  student_a1: { name: "Student A1", group: "Alzheimer's", role: "Student Researcher", diseaseScope: "Alzheimer's" },
  student_a2: { name: "Student A2", group: "Alzheimer's", role: "Student Researcher", diseaseScope: "Alzheimer's" },
  student_b1: { name: "Student B1", group: "GBM", role: "Student Researcher", diseaseScope: "GBM" },
  student_b2: { name: "Student B2", group: "GBM", role: "Student Researcher", diseaseScope: "GBM" },
  student_c1: { name: "Student C1", group: "Stroke", role: "Student Researcher", diseaseScope: "Stroke" },
  student_c2: { name: "Student C2", group: "Stroke", role: "Student Researcher", diseaseScope: "Stroke" },
  supervisor: { name: "Dr. Nur Mustafaoğlu", group: "Supervisor", role: "Faculty / Project Supervisor", diseaseScope: "ALL" }
};
