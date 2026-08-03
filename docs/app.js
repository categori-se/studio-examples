"use strict";

import {
  evidenceChainPosture,
  evaluationPassed,
  lineageFor,
  manifestFor,
  projectPosture,
  projectReleasePosture,
  projectStage,
  projects,
  rubricFor
} from "./demo-model.js";

let selectedProjectId = projects[0].id;
let activeTab = "evidence";

const elements = {
  projectList: document.querySelector("#project-list"),
  projectState: document.querySelector("#project-state"),
  projectId: document.querySelector("#project-id"),
  projectTitle: document.querySelector("#project-title"),
  projectSummary: document.querySelector("#project-summary"),
  projectFacts: document.querySelector("#project-facts"),
  projectNotice: document.querySelector("#project-notice"),
  briefQuestion: document.querySelector("#brief-question"),
  briefFacts: document.querySelector("#brief-facts"),
  lineage: document.querySelector("#lineage"),
  targetStatus: document.querySelector("#target-status"),
  targetRecord: document.querySelector("#target-record"),
  releaseStatus: document.querySelector("#release-status"),
  releaseRecord: document.querySelector("#release-record"),
  evidenceGrid: document.querySelector("#evidence-grid"),
  manifestCode: document.querySelector("#manifest-code"),
  rubricView: document.querySelector("#rubric-view")
};

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function field(label, value, missingText = "Not recorded") {
  const missing = value === null || value === undefined || value === "";
  return `<div><dt>${escapeHtml(label)}</dt><dd${missing ? ' class="missing-value"' : ""}>${escapeHtml(missing ? missingText : value)}</dd></div>`;
}

function renderProjectList() {
  elements.projectList.innerHTML = projects.map((project) => {
    const stage = projectStage(project);
    const selected = project.id === selectedProjectId;
    return `
      <div role="listitem"><button class="project-button" type="button" data-project="${escapeHtml(project.id)}" aria-pressed="${selected}">
        <span>${escapeHtml(project.id)} <i class="dot dot-${stage.dot}" aria-hidden="true"></i></span>
        <strong>${escapeHtml(project.name)}</strong>
        <small>${escapeHtml(stage.label)}</small>
      </button></div>`;
  }).join("");
}

function renderLineage(project) {
  elements.lineage.innerHTML = lineageFor(project).map((stage) => `
    <li class="lineage-item is-${stage.state}">
      <span class="lineage-step" aria-hidden="true">${stage.code}</span>
      <strong>${escapeHtml(stage.label)}</strong>
      <small>${escapeHtml(stage.detail)}</small>
    </li>`).join("");
}

function renderRecords(project) {
  const target = project.target;
  elements.targetStatus.className = `mini-status status-${target ? "configured" : "not-recorded"}`;
  elements.targetStatus.textContent = target ? "Configured" : "Not configured";
  elements.targetRecord.innerHTML = [
    field("Target ID", target?.id),
    field("Kind", target?.kind),
    field("Environment", target?.environment),
    field("Release trigger", target?.trigger),
    field("Release authority", target?.releaseAuthority)
  ].join("");

  const release = project.release;
  const releaseState = projectReleasePosture(project);
  const chainState = evidenceChainPosture(project);
  elements.releaseStatus.className = `mini-status status-${releaseState.state}`;
  elements.releaseStatus.textContent = releaseState.label;
  elements.releaseRecord.innerHTML = [
    field("Commit SHA", release?.commitSha),
    field("Artifact digest", release?.artifact?.digest || release?.artifactDigest),
    field("Workflow", release ? `${release.workflow.provider} / ${release.workflow.runId}` : null),
    field("Actor · result", release ? `${release.actor} · ${release.result}` : null),
    field("Deployed at", release?.deployedAt),
    field("Evidence chain", project.evidenceChain ? chainState.label : null)
  ].join("");
}

function renderEvidence(project) {
  if (!project.claims.length) {
    elements.evidenceGrid.innerHTML = '<div class="empty-card"><div><strong>No findings declared</strong>Add a bounded finding and connect it to an explicit source before evaluation.</div></div>';
    return;
  }

  elements.evidenceGrid.innerHTML = project.claims.map((claim) => {
    const status = claim.refs.length > 0 ? "complete" : "missing";
    const links = claim.refs.length
      ? claim.refs.map((ref) => `<span>${escapeHtml(ref)}</span>`).join("")
      : '<span class="missing-value">No evidence references</span>';
    return `
      <article class="claim-card">
        <div class="claim-heading">
          <span>${escapeHtml(claim.id)}</span>
          <span class="mini-status status-${status}">${escapeHtml(claim.status)}</span>
        </div>
        <p>${escapeHtml(claim.text)}</p>
        <div class="claim-links" aria-label="Evidence references">${links}</div>
      </article>`;
  }).join("");
}

function renderRubric(project) {
  const evaluation = project.evaluation;
  if (!evaluation) {
    elements.rubricView.innerHTML = `
      <div class="empty-card">
        <div><strong>Evaluation not defined</strong>A candidate should not be presented as tested until a versioned rubric and result exist.</div>
      </div>`;
    return;
  }

  const rubric = rubricFor(project);
  const passed = evaluationPassed(evaluation);
  elements.rubricView.innerHTML = `
    <div class="rubric-summary">
      <div><h5>${escapeHtml(rubric.name)} · v${escapeHtml(rubric.version)}</h5><p>Passing score ${evaluation.passing} / 5 · weighted criteria · ${passed ? "passed" : "did not pass"}</p></div>
      <div class="score-ring" aria-label="Score ${evaluation.score} out of 5">${evaluation.score}</div>
    </div>
    <div class="criteria-list">
      ${evaluation.criteria.map((criterion) => `
        <article class="criterion">
          <strong>${escapeHtml(criterion.name)} · ${Math.round(criterion.weight * 100)}%</strong>
          <span class="criterion-score">${criterion.score} / 5</span>
          <p>${escapeHtml(criterion.description)}</p>
        </article>`).join("")}
    </div>
    ${evaluation.humanRequired ? `<p class="human-gate"><strong>Human review remains required.</strong> ${passed ? "Passing" : "Evaluating"} this rubric does not approve or release the project.</p>` : ""}`;
}

function renderProject() {
  const project = projects.find((candidate) => candidate.id === selectedProjectId) || projects[0];
  const posture = projectPosture(project);
  elements.projectState.className = `status-pill status-${posture.className}`;
  elements.projectState.textContent = posture.label;
  elements.projectId.textContent = `project / ${project.id}`;
  elements.projectTitle.textContent = project.name;
  elements.projectSummary.textContent = project.summary;
  elements.projectFacts.innerHTML = [
    field("Accountable owner", project.owner, "Missing owner"),
    field("Brief", project.brief?.deliverable, "Missing brief"),
    field("Data sensitivity", project.sensitivity),
    field("Risk level", project.risk),
    field("Expert decision", project.decision?.status, "No decision policy"),
    field("Evaluation", project.evaluation ? `${evaluationPassed(project.evaluation) ? "Passed" : "Did not pass"} · ${project.evaluation.score}/5` : null, "Not defined"),
    field("Exact release", project.release ? projectReleasePosture(project).label : null, "No release record"),
    field("Handoff", project.handoff?.status, "Not defined")
  ].join("");
  elements.projectNotice.className = `project-notice notice-${posture.noticeClass}`;
  elements.projectNotice.textContent = posture.detail;
  elements.briefQuestion.textContent = project.brief?.question || "No review question has been recorded.";
  elements.briefFacts.innerHTML = [
    field("Deliverable", project.brief?.deliverable, "Not defined"),
    field("Audience", project.brief?.audience, "Not defined")
  ].join("");
  renderLineage(project);
  renderRecords(project);
  renderEvidence(project);
  elements.manifestCode.textContent = manifestFor(project);
  renderRubric(project);
  renderProjectList();
}

function activateTab(tabName, focus = false) {
  activeTab = tabName;
  document.querySelectorAll("[role='tab']").forEach((tab) => {
    const active = tab.dataset.tab === activeTab;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active && focus) tab.focus();
  });
  document.querySelectorAll("[role='tabpanel']").forEach((panel) => {
    panel.hidden = panel.id !== `panel-${activeTab}`;
  });
}

elements.projectList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-project]");
  if (!button) return;
  selectedProjectId = button.dataset.project;
  renderProject();
});

document.querySelector(".tab-list").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-tab]");
  if (tab) activateTab(tab.dataset.tab);
});

document.querySelector(".tab-list").addEventListener("keydown", (event) => {
  const tabs = [...document.querySelectorAll("[role='tab']")];
  const index = tabs.indexOf(event.target);
  if (index < 0 || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  let nextIndex = index;
  if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
  if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = tabs.length - 1;
  activateTab(tabs[nextIndex].dataset.tab, true);
});

document.querySelector("[data-open-tab='manifest']").addEventListener("click", () => {
  activateTab("manifest", true);
  document.querySelector("#panel-manifest").scrollIntoView({ behavior: "smooth", block: "nearest" });
});

renderProject();
activateTab(activeTab);
