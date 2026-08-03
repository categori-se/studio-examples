"use strict";

export const projects = [
  {
    id: "evidence-review",
    name: "Public service access review",
    summary: "A synthetic planning brief asks whether usage, accessibility, and readiness records support a bounded shortlist for field review.",
    stateDetail: "Six portable records form one contract-bound synthetic chain: exact document set, cited machine evaluation, separate expert decision, reviewed artifact, release record, and read-only handoff.",
    owner: "Service planning lead",
    sensitivity: "Public",
    risk: "Moderate",
    repository: "example/evidence-review",
    commit: "72ac91d4c7f2e12a3bdc1c844580cac82de9c341",
    brief: {
      question: "Which candidate service locations are sufficiently supported for field review, and which evidence gaps must remain explicit?",
      deliverable: "Service access shortlist",
      audience: "Regional planning committee"
    },
    sources: [
      {id: "synthetic-service-record", label: "Fictional service-access planning record", kind: "document"}
    ],
    claims: [
      {id: "qualified-service-shortlist", text: "The fictional record supports advancing North District to field review while River Ward remains qualified by an accessibility evidence gap.", status: "Supported", refs: ["synthetic-service-record"]}
    ],
    policy: {
      profile: "evidence-reviewer",
      tools: ["read_file"],
      rules: ["Use only declared resources", "Cite every material finding", "Preserve incomplete accessibility evidence", "Leave prioritization to the accountable service-planning lead"]
    },
    evaluation: {
      status: "Passed",
      score: 4.4,
      passing: 4,
      humanRequired: true,
      criteria: [
        {name: "Finding traceability", description: "Every material finding names a declared evidence resource.", weight: 0.6, score: 4.5},
        {name: "Scope discipline", description: "The shortlist preserves unresolved field and accessibility checks instead of overstating readiness.", weight: 0.4, score: 4.25}
      ]
    },
    decision: {status: "Accepted", actor: "synthetic-service-planning-reviewer", outcome: "APPROVED_WITH_QUALIFICATION", at: "2026-08-01T18:00:00Z"},
    target: {status: "Configured", id: "local-preview", kind: "static-site", environment: "local", trigger: "manual exact-SHA workflow dispatch", releaseAuthority: "project-ci"},
    release: {
      schemaVersion: 2,
      projectId: "evidence-review",
      repository: "example/evidence-review",
      targetId: "local-preview",
      environment: "local",
      commitSha: "72ac91d4c7f2e12a3bdc1c844580cac82de9c341",
      artifact: {
        uri: "https://example.invalid/studio-examples/evidence-review/release-artifact.json",
        digest: "sha256:212d3db4d6b22f0be1a9e562357af133730358749f378c294ddd329a38f75a5b"
      },
      workflow: {
        provider: "github-actions",
        runId: "synthetic-run-207",
        url: "https://example.invalid/actions/runs/synthetic-run-207"
      },
      actor: "synthetic-release-bot",
      operation: "DEPLOY",
      result: "SUCCEEDED",
      deployedAt: "2026-08-01T18:12:00Z",
      deployedUrl: "https://example.invalid/studio-examples/evidence-review",
      verification: {
        method: "release-manifest",
        url: "https://example.invalid/studio-examples/evidence-review/release-artifact.json",
        verifiedAt: "2026-08-01T18:13:00Z"
      }
    },
    handoff: {status: "Verified", scope: "Synthetic regional committee reviewer · read-only qualified shortlist", packet: "records/handoff.json"},
    evidenceChain: {
      recordSet: "portfolio/projects/evidence-review/records/",
      documentSet: {
        projectId: "evidence-review",
        sha256: "b828dcc466d3c4dc5b0849d0da1ef68886b739ec7dd09fa2eece3ac5de145958"
      },
      evaluation: {
        evaluationId: "123e4567-e89b-42d3-a456-4266aa1740ef",
        projectId: "evidence-review",
        documentManifestSha256: "b828dcc466d3c4dc5b0849d0da1ef68886b739ec7dd09fa2eece3ac5de145958",
        sha256: "dd9bc6dcbe3c0adb866c9b284d3cacf420d163f3f016a0aec83487d12adf044e",
        machineOutcome: "passed",
        humanReviewStatus: "pending"
      },
      reviewDecision: {
        projectId: "evidence-review",
        evaluationId: "123e4567-e89b-42d3-a456-4266aa1740ef",
        resultSha256: "dd9bc6dcbe3c0adb866c9b284d3cacf420d163f3f016a0aec83487d12adf044e",
        sha256: "1190cb08df898a1cddbfba39b5e2eb86db1c5f2e8630c6324c83b33e74e88403",
        outcome: "approved",
        effect: "human_evaluation_review",
        operationalEffects: false
      },
      releaseArtifact: {
        projectId: "evidence-review",
        reviewDecisionSha256: "1190cb08df898a1cddbfba39b5e2eb86db1c5f2e8630c6324c83b33e74e88403",
        sha256: "212d3db4d6b22f0be1a9e562357af133730358749f378c294ddd329a38f75a5b"
      },
      releaseRecord: {
        projectId: "evidence-review",
        artifactDigest: "sha256:212d3db4d6b22f0be1a9e562357af133730358749f378c294ddd329a38f75a5b",
        sha256: "31455885756d81cc78bca44062507195bca97f5dc9001c87a3a89b962bd64122",
        result: "SUCCEEDED"
      },
      handoff: {
        projectId: "evidence-review",
        reviewDecisionSha256: "1190cb08df898a1cddbfba39b5e2eb86db1c5f2e8630c6324c83b33e74e88403",
        releaseRecordSha256: "31455885756d81cc78bca44062507195bca97f5dc9001c87a3a89b962bd64122",
        sha256: "68b387f6bdfd5d7b397943523665e8773ee5d43db7bbeb12d41c7c83af1d3bbc",
        access: "read_only",
        status: "verified"
      }
    }
  },
  {
    id: "engineering-change-brief",
    name: "Equipment change assurance brief",
    summary: "A synthetic engineering team prepares a source-linked readiness brief for an operational change handoff.",
    stateDetail: "The evidence rubric passed, but the technical-assurance lead's decision is still pending. A review target exists; no exact release or handoff has been recorded.",
    owner: "Technical assurance lead",
    sensitivity: "Public",
    risk: "Moderate",
    repository: "example/engineering-change-brief",
    commit: "72ac91d4",
    brief: {
      question: "Do the declared bench results and change records support a controlled field trial, and which operating limits must travel with it?",
      deliverable: "Change assurance pack",
      audience: "Synthetic operations review team"
    },
    sources: [
      {id: "bench-results", label: "Synthetic bench-test results", kind: "dataset"},
      {id: "change-log", label: "Synthetic engineering change log", kind: "document"},
      {id: "operating-limits", label: "Synthetic operating-limits note", kind: "document"}
    ],
    claims: [
      {id: "bench-envelope-met", text: "The declared bench results meet the synthetic acceptance envelope for a bounded field trial.", status: "Supported", refs: ["bench-results", "change-log"]},
      {id: "operating-limit-retained", text: "The field trial must retain the temperature and duty-cycle limits stated in the evidence pack.", status: "Verified", refs: ["bench-results", "operating-limits"]}
    ],
    policy: {
      profile: "engineering-evidence-reviewer",
      tools: ["search_declared_sources", "read_document"],
      rules: ["Use read-only tools", "Attach source IDs to findings", "Preserve declared operating limits", "Do not infer production approval"]
    },
    evaluation: {
      status: "Passed",
      score: 4.8,
      passing: 4.2,
      humanRequired: true,
      criteria: [
        {name: "Finding traceability", description: "The cited record directly supports each finding.", weight: 0.5, score: 4.9},
        {name: "Limitation fidelity", description: "The brief carries forward material operating limits in the declared records.", weight: 0.3, score: 4.7},
        {name: "Review reproducibility", description: "A second reviewer can reconstruct the finding from the exact source set.", weight: 0.2, score: 4.8}
      ]
    },
    decision: {status: "Pending", actor: null, outcome: null, at: null},
    target: {status: "Configured", id: "operations-handoff", kind: "static-site", environment: "review", trigger: "manual exact-SHA workflow dispatch", releaseAuthority: "project-ci"},
    release: null,
    handoff: {status: "Waiting", scope: "Not issued until expert approval and an exact release exist"}
  },
  {
    id: "research-synthesis-intake",
    name: "Research synthesis intake",
    summary: "An early brief for checking whether a synthetic evidence set is ready for a specialist literature synthesis.",
    stateDetail: "This draft has a brief, but ownership, source declarations, bounded findings, agent policy, evaluation, expert decision, target, exact release, and handoff are intentionally missing.",
    owner: null,
    sensitivity: "Unassessed",
    risk: "Unassessed",
    repository: "example/research-synthesis-intake",
    commit: "not recorded",
    brief: {
      question: "Does the proposed literature set cover the populations, periods, and methods required for specialist synthesis?",
      deliverable: "Synthesis readiness note",
      audience: "Research methods specialist"
    },
    sources: [],
    claims: [
      {id: "study-coverage", text: "The proposed literature set covers the populations and methods required by the review question.", status: "Unsubstantiated", refs: []}
    ],
    policy: null,
    evaluation: null,
    decision: null,
    target: null,
    release: null,
    handoff: null
  }
];

function normalized(value) {
  return String(value ?? "").trim().toUpperCase().replaceAll("-", "_").replaceAll(" ", "_");
}

function slug(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function yamlScalar(value) {
  return JSON.stringify(String(value));
}

function yamlList(values, indentation) {
  const pad = " ".repeat(indentation);
  if (!values?.length) return `${pad}[]`;
  return values.map((value) => `${pad}- ${yamlScalar(value)}`).join("\n");
}

export function evaluationPassed(evaluation) {
  return Boolean(
    evaluation
    && normalized(evaluation.status) === "PASSED"
    && Number.isFinite(evaluation.score)
    && Number.isFinite(evaluation.passing)
    && evaluation.score >= evaluation.passing
  );
}

export function releasePosture(release) {
  if (!release) return {state: "missing", label: "Not recorded", succeeded: false};
  const result = normalized(release.result);
  if (result === "SUCCEEDED") return {state: "succeeded", label: "Succeeded · checking chain", succeeded: true};
  if (result === "FAILED") return {state: "failed", label: "Failed", succeeded: false};
  if (result === "ROLLED_BACK") return {state: "rolled-back", label: "Rolled back", succeeded: false};
  return {state: "incomplete", label: "Outcome missing", succeeded: false};
}

const SHA256 = /^[0-9a-f]{64}$/;

function incompleteChain(label) {
  return {state: "incomplete", label, verified: false};
}

export function evidenceChainPosture(project) {
  const chain = project?.evidenceChain;
  if (!chain) return {state: "missing", label: "Evidence chain not recorded", verified: false};

  const records = [
    chain.documentSet,
    chain.evaluation,
    chain.reviewDecision,
    chain.releaseArtifact,
    chain.releaseRecord,
    chain.handoff
  ];
  if (records.some((record) => !record || record.projectId !== project.id || !SHA256.test(record.sha256 || ""))) {
    return incompleteChain("Record identity or digest gap");
  }
  if (
    chain.evaluation.documentManifestSha256 !== chain.documentSet.sha256
    || chain.evaluation.machineOutcome !== "passed"
    || chain.evaluation.humanReviewStatus !== "pending"
  ) {
    return incompleteChain("Evaluation is not bound to the exact document set");
  }
  if (
    chain.reviewDecision.evaluationId !== chain.evaluation.evaluationId
    || chain.reviewDecision.resultSha256 !== chain.evaluation.sha256
    || chain.reviewDecision.outcome !== "approved"
    || chain.reviewDecision.effect !== "human_evaluation_review"
    || chain.reviewDecision.operationalEffects !== false
  ) {
    return incompleteChain("Expert decision is not bound to the reviewed evaluation");
  }
  if (
    chain.releaseArtifact.reviewDecisionSha256 !== chain.reviewDecision.sha256
    || chain.releaseRecord.artifactDigest !== `sha256:${chain.releaseArtifact.sha256}`
    || chain.releaseRecord.result !== "SUCCEEDED"
  ) {
    return incompleteChain("Release is not bound to the reviewed artifact");
  }
  if (
    chain.handoff.reviewDecisionSha256 !== chain.reviewDecision.sha256
    || chain.handoff.releaseRecordSha256 !== chain.releaseRecord.sha256
    || chain.handoff.access !== "read_only"
    || chain.handoff.status !== "verified"
  ) {
    return incompleteChain("Handoff is not bound to the decision and release");
  }
  if (
    project.release?.projectId !== project.id
    || project.release?.artifact?.digest !== chain.releaseRecord.artifactDigest
    || project.release?.result !== chain.releaseRecord.result
  ) {
    return incompleteChain("Displayed release does not match the bound release record");
  }
  return {state: "verified", label: "Contract-bound chain", verified: true};
}

export function projectReleasePosture(project) {
  const release = releasePosture(project?.release);
  if (release.succeeded && !evaluationPassed(project?.evaluation)) {
    return {state: "incomplete", label: "Succeeded · evaluation gap", succeeded: false};
  }
  if (release.succeeded && project?.decision?.status !== "Accepted") {
    return {state: "incomplete", label: "Succeeded · expert decision gap", succeeded: false};
  }
  if (release.succeeded && project?.handoff?.status !== "Verified") {
    return {state: "incomplete", label: "Succeeded · handoff gap", succeeded: false};
  }
  if (release.succeeded) {
    const chain = evidenceChainPosture(project);
    if (!chain.verified) return {state: "incomplete", label: `Succeeded · ${chain.label.toLowerCase()}`, succeeded: false};
    return {state: "verified", label: chain.label, succeeded: true};
  }
  return release;
}

export function projectPosture(project) {
  const release = projectReleasePosture(project);
  if (release.state === "verified") {
    return {label: "Released", className: "released", noticeClass: "ready", detail: project.stateDetail};
  }
  if (release.state === "failed") {
    return {label: "Release failed", className: "incomplete", noticeClass: "missing", detail: "A release record exists, but its workflow outcome is FAILED. The project is not presented as released."};
  }
  if (release.state === "rolled-back") {
    return {label: "Rolled back", className: "review", noticeClass: "pending", detail: "The recorded release was rolled back. A new reviewed release is required before a handoff can be presented as current."};
  }
  if (release.state === "incomplete") {
    return {label: "Record gap", className: "incomplete", noticeClass: "missing", detail: "A successful workflow result exists, but required evaluation or expert-decision evidence is incomplete. The project is not presented as released."};
  }
  if (evaluationPassed(project.evaluation) && project.decision?.status === "Pending") {
    return {label: "Review required", className: "review", noticeClass: "pending", detail: project.stateDetail};
  }
  return {label: "Incomplete", className: "incomplete", noticeClass: "missing", detail: project.stateDetail};
}

export function projectStage(project) {
  const release = projectReleasePosture(project);
  if (release.succeeded) return {label: "released", dot: "ready"};
  if (release.state === "failed") return {label: "release failed", dot: "missing"};
  if (release.state === "rolled-back") return {label: "rolled back", dot: "pending"};
  if (project.decision?.status === "Pending") return {label: "review waiting", dot: "pending"};
  return {label: "record gaps", dot: "missing"};
}

export function lineageFor(project) {
  const hasBrief = Boolean(project.brief?.question && project.brief?.deliverable && project.brief?.audience);
  const hasSources = project.sources.length > 0;
  const claimsSupported = project.claims.length > 0 && project.claims.every((claim) => claim.refs.length > 0 && claim.status !== "Unsubstantiated");
  const hasPolicy = Boolean(project.policy);
  const hasEvaluation = Boolean(project.evaluation);
  const passedEvaluation = evaluationPassed(project.evaluation);
  const evaluationState = !hasEvaluation ? "missing" : passedEvaluation ? "ready" : "failed";
  const decisionState = project.decision?.status === "Accepted" ? "ready" : project.decision?.status === "Pending" ? "pending" : "missing";
  const release = projectReleasePosture(project);
  const handoffState = project.handoff?.status === "Verified" && release.succeeded ? "verified" : project.handoff?.status === "Waiting" ? "pending" : "missing";

  return [
    {code: "B", label: "Brief", detail: hasBrief ? project.brief.deliverable : "Not defined", state: hasBrief ? "ready" : "missing"},
    {code: "S", label: "Sources", detail: hasSources ? `${project.sources.length} declared` : "None declared", state: hasSources ? "ready" : "missing"},
    {code: "F", label: "Findings", detail: claimsSupported ? `${project.claims.length} bounded` : "Support missing", state: claimsSupported ? "ready" : "missing"},
    {code: "P", label: "Agent policy", detail: hasPolicy ? `${project.policy.tools.length} allowed tools` : "Not defined", state: hasPolicy ? "ready" : "missing"},
    {code: "E", label: "Evaluation", detail: !hasEvaluation ? "Not run" : passedEvaluation ? `${project.evaluation.score} / 5 passed` : `${project.evaluation.score} / 5 did not pass`, state: evaluationState},
    {code: "D", label: "Expert decision", detail: decisionState === "ready" ? "Accepted" : decisionState === "pending" ? "Waiting" : "Not defined", state: decisionState},
    {code: "R", label: "Exact release", detail: release.label, state: release.state},
    {code: "H", label: "Handoff", detail: project.handoff?.scope || "Not defined", state: handoffState}
  ];
}

export function rubricFor(project) {
  if (!project.evaluation) return null;
  return {
    schemaVersion: 1,
    id: "evidence-quality",
    name: "Evidence quality",
    version: "1.0.0",
    criteria: project.evaluation.criteria.map((criterion) => ({
      id: slug(criterion.name),
      label: criterion.name,
      description: criterion.description,
      weight: criterion.weight,
      minScore: 0,
      maxScore: 5
    })),
    passingScore: project.evaluation.passing,
    humanReviewRequired: project.evaluation.humanRequired
  };
}

export function manifestFor(project) {
  const owner = project.owner
    ? `\n  - id: ${yamlScalar(slug(project.owner))}\n    role: ${yamlScalar(project.owner)}`
    : " [] # MISSING: accountable owner";
  const resources = project.sources.length
    ? `\n${project.sources.map((source) => `  - id: ${yamlScalar(source.id)}\n    kind: ${yamlScalar(source.kind)}\n    uri: ${yamlScalar(`fixtures/${source.id}.md`)}\n    sensitivity: public`).join("\n")}`
    : " [] # MISSING: declared sources";
  const profile = project.policy
    ? `\n  - id: ${yamlScalar(project.policy.profile)}\n    instructionsPath: ${yamlScalar(`instructions/${project.policy.profile}.md`)}\n    allowedTools:\n${yamlList(project.policy.tools, 6)}\n    acceptanceCriteria:\n${yamlList(project.policy.rules, 6)}`
    : " [] # MISSING: bounded agent policy";
  const evaluation = project.evaluation
    ? `\n  - id: "evidence-quality"\n    rubricPath: "rubrics/evidence-quality.yaml"\n    requiredFor:\n      - candidate\n      - release`
    : " [] # MISSING: repeatable evaluation";
  const target = project.target
    ? `\n  - id: ${yamlScalar(project.target.id)}\n    kind: ${yamlScalar(project.target.kind)}\n    environment: ${yamlScalar(project.target.environment)}\n    releaseManifestUri: "releases/release-manifest.json"`
    : " [] # MISSING: declared deployment target";
  const claims = project.claims.length && project.claims.every((claim) => claim.refs.length)
    ? `\n${project.claims.map((claim) => `    - id: ${yamlScalar(claim.id)}\n      statement: ${yamlScalar(claim.text)}\n      evidenceRefs:\n${yamlList(claim.refs, 8)}`).join("\n")}`
    : " [] # MISSING: claims with evidence references";
  const sensitivity = project.sensitivity === "Unassessed"
    ? "# dataSensitivity: MISSING"
    : `dataSensitivity: ${yamlScalar(project.sensitivity.toLowerCase())}`;
  const risk = project.risk === "Unassessed"
    ? "# riskLevel: MISSING"
    : `riskLevel: ${yamlScalar(project.risk.toLowerCase())}`;
  const approval = project.policy
    ? "approvalPolicy:\n  requiredFor:\n    - release\n    - rollback\n  roles:\n    - domain-reviewer"
    : "# approvalPolicy: MISSING";

  return `schemaVersion: 1
id: ${yamlScalar(project.id)}
name: ${yamlScalar(project.name)}
summary: ${yamlScalar(project.summary)}
repository: ${yamlScalar(project.repository)}
defaultBranch: "main"
${sensitivity}
commands:
  checks:
    - "node --test"
modelPolicy:
  mode: local_only
owners:${owner}
purpose:
  problem: ${yamlScalar(project.brief?.question || project.summary)}
  audiences:
    - ${yamlScalar(project.brief?.audience || "Review team")}
  permittedClaims:${claims}
resources:${resources}
agentProfiles:${profile}
evaluationSuites:${evaluation}
${approval}
deploymentTargets:${target}
${risk}`;
}
