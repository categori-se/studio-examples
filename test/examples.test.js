import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {lstat, readdir, readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import project from "../local-demo/project.json" with {type: "json"};
import {event as noContentEvent} from "../portfolio/no-content-telemetry.mjs";
import {
  assertDocumentEvaluationResult,
  assertDocumentReviewDecision,
  assertDocumentSetManifest,
  assertEvaluationRubric,
  assertReleaseRecord,
  assertReleaseRecordV2,
  GENAI_EVENT_NAMES,
  validateProject
} from "@categori/studio-contracts";
import {loadWorkspaceFile, parseStudioDocument} from "@categori/studio-core/project-files";
import {
  evidenceChainPosture,
  evaluationPassed,
  lineageFor,
  manifestFor,
  projectPosture,
  projectReleasePosture,
  projectStage,
  projects,
  releasePosture,
  rubricFor
} from "../docs/demo-model.js";
import {verifyLocalDemo, verifyPublishedDemo} from "../scripts/verify-demo-assets.mjs";

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

async function readJsonRecord(filename) {
  const content = await readFile(new URL(`../portfolio/projects/evidence-review/records/${filename}`, import.meta.url));
  return {content, digest: sha256(content), value: JSON.parse(content)};
}

test("legacy JSON example uses the backward-compatible public project contract", () => {
  assert.deepEqual(validateProject(project), []);
});

test("portable workspace connects a governed project and evidence rubric", async () => {
  const workspacePath = fileURLToPath(new URL("../portfolio/workspace.yaml", import.meta.url));
  const loaded = await loadWorkspaceFile(workspacePath);
  assert.equal(loaded.workspace.id, "evidence-portfolio");
  assert.match(loaded.workspace.name, /Reference portfolio: synthetic service-access evidence review/);
  assert.equal(loaded.projects.length, 1);
  const governed = loaded.projects[0].project;
  assert.equal(governed.id, "evidence-review");
  assert.deepEqual(governed.purpose.permittedClaims[0].evidenceRefs, ["synthetic-service-record"]);
  assert.deepEqual(governed.approvalPolicy.requiredFor, ["release", "rollback"]);
  assert.match(governed.name, /Service access evidence review/);

  const rubricPath = new URL("../portfolio/projects/evidence-review/rubrics/evidence-quality.yaml", import.meta.url);
  const rubric = assertEvaluationRubric(parseStudioDocument(await readFile(rubricPath, "utf8"), {filename: rubricPath.pathname}));
  assert.equal(rubric.humanReviewRequired, true);
  assert.equal(rubric.criteria.length, 2);
});

test("portable records form a contract-valid document-to-handoff evidence chain", async () => {
  const [documentSet, evaluation, decision, artifact, release, handoff] = await Promise.all([
    readJsonRecord("document-set.json"),
    readJsonRecord("evaluation-result.json"),
    readJsonRecord("review-decision.json"),
    readJsonRecord("release-artifact.json"),
    readJsonRecord("release-record.json"),
    readJsonRecord("handoff.json")
  ]);
  const source = await readFile(new URL("../portfolio/projects/evidence-review/fixtures/public-guidance.md", import.meta.url));
  const rubric = await readFile(new URL("../portfolio/projects/evidence-review/rubrics/evidence-quality.yaml", import.meta.url));

  assert.doesNotThrow(() => assertDocumentSetManifest(documentSet.value));
  assert.doesNotThrow(() => assertDocumentEvaluationResult(evaluation.value));
  assert.doesNotThrow(() => assertDocumentReviewDecision(decision.value));
  assert.doesNotThrow(() => assertReleaseRecordV2(release.value));

  assert.equal(documentSet.value.documents[0].sha256, sha256(source));
  assert.equal(evaluation.value.document_manifest_sha256, documentSet.digest);
  assert.equal(evaluation.value.rubric.sha256, sha256(rubric));
  assert.equal(evaluation.value.human_review.status, "pending");
  assert.equal(evaluation.value.criteria.every((criterion) => criterion.citations.length > 0), true);
  for (const criterion of evaluation.value.criteria) {
    for (const citation of criterion.citations) {
      assert.equal(citation.document_id, documentSet.value.documents[0].id);
      assert.equal(citation.chunk_sha256, sha256(citation.excerpt));
    }
  }

  assert.equal(decision.value.evaluation_id, evaluation.value.evaluation_id);
  assert.equal(decision.value.result_sha256, evaluation.digest);
  assert.equal(decision.value.outcome, "approved");
  assert.deepEqual(
    [decision.value.deploy_authorized, decision.value.trading_authorized, decision.value.production_deployed, decision.value.source_mutated],
    [false, false, false, false]
  );
  assert.equal(artifact.value.review_decision.sha256, decision.digest);
  assert.equal(artifact.value.commit_sha, release.value.commitSha);
  assert.equal(release.value.artifact.digest, `sha256:${artifact.digest}`);
  assert.equal(handoff.value.review_decision.sha256, decision.digest);
  assert.equal(handoff.value.release_record.sha256, release.digest);
  assert.equal(handoff.value.access, "read_only");
  assert.equal(handoff.value.status, "verified");

  const displayed = projects.find((item) => item.id === "evidence-review");
  assert.equal(displayed.evidenceChain.documentSet.sha256, documentSet.digest);
  assert.equal(displayed.evidenceChain.evaluation.sha256, evaluation.digest);
  assert.equal(displayed.evidenceChain.reviewDecision.sha256, decision.digest);
  assert.equal(displayed.evidenceChain.releaseArtifact.sha256, artifact.digest);
  assert.equal(displayed.evidenceChain.releaseRecord.sha256, release.digest);
  assert.equal(displayed.evidenceChain.handoff.sha256, handoff.digest);
  assert.deepEqual(displayed.release, release.value);
  assert.equal(evidenceChainPosture(displayed).verified, true);
});

test("telemetry example does not emit content-bearing attributes by default", () => {
  assert.equal(noContentEvent.name, GENAI_EVENT_NAMES.OPERATION_DETAILS);
  const serialized = JSON.stringify(noContentEvent);
  assert.doesNotMatch(serialized, /private input|private output|private instructions|private_tool|private value/);
  assert.equal(noContentEvent.attributes["gen_ai.usage.input_tokens"], 12);
});

test("public reference page is dependency-free and explains both operating modes", async () => {
  const html = await readFile(new URL("../docs/index.html", import.meta.url), "utf8");
  const script = await readFile(new URL("../docs/app.js", import.meta.url), "utf8");
  const model = await readFile(new URL("../docs/demo-model.js", import.meta.url), "utf8");

  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /Governed expert work/);
  assert.match(html, /Keep evidence, AI assistance, expert judgment, and handoff connected/);
  assert.match(html, /service planning, engineering assurance, and research/);
  assert.match(html, /This is not a chatbot or an automated professional verdict/);
  assert.match(html, /The reusable product is the governance pattern, not the sector vocabulary/);
  assert.match(html, /research synthesis, engineering assurance, policy review, due diligence/);
  assert.match(html, /A configured target is not a verified release/);
  assert.match(html, /Apache-2.0 · portable · complete example/);
  assert.match(html, /Run locally, adapt, or self-host/);
  assert.match(html, /Private service · optional/);
  assert.match(html, /The public example is not a trial or a thin client/);
  assert.match(html, /Available in the current control plane/);
  assert.match(html, /Planned managed operations/);
  assert.match(html, /no API, analytics, or telemetry calls after static assets load/);
  assert.match(html, /No operating permissions/);
  assert.match(html, /128 KiB packaged ceiling/);
  assert.match(html, /far below \$0\.10 for an ordinary visitor-day/);
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /form-action 'none'/);
  assert.equal((html.match(/class="info-icon"/g) || []).length, 4);
  assert.match(html, /id="lineage"[^>]+tabindex="0"/);
  assert.match(html, /studio-contracts/);
  assert.match(html, /studio-core/);
  assert.match(html, /studio-examples/);
  assert.match(html, /packages are not on npm yet/);
  assert.doesNotMatch(html, /<title>[^<]*Environmental and social/i);
  assert.doesNotMatch(html, /E&amp;S|ESIA|environmental-social/i);
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:/i);
  assert.doesNotMatch(html, /<link[^>]+href=["']https?:[^>]+stylesheet/i);
  assert.doesNotMatch(script, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/);
  assert.doesNotMatch(script, /sendBeacon\s*\(/);
  assert.doesNotMatch(model, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/);
  assert.doesNotMatch(model, /sendBeacon\s*\(/);
});

test("the complete static public demo remains below its 128 KiB packaged ceiling", async () => {
  const assets = [".nojekyll", "app.js", "demo-model.js", "favicon.svg", "index.html", "styles.css"];
  const docs = new URL("../docs/", import.meta.url);
  const entries = (await readdir(docs, {withFileTypes: true}))
    .sort((left, right) => left.name.localeCompare(right.name));
  assert.deepEqual(entries.map((entry) => entry.name), assets);
  assert.ok(entries.every((entry) => entry.isFile()), "docs contains only reviewed files");

  const payloads = [];
  const forbiddenText = [
    ["operator filesystem path", /\/home\//i],
    ["AWS ARN", /\barn:aws(?:-[a-z]+)?:/i],
    ["S3 URI", /\bs3:\/\//i],
    ["AWS service endpoint", /(?:amazonaws\.com|execute-api|amazoncognito)/i],
    ["CloudFront distribution", /\bE[A-Z0-9]{13}\b/],
    ["browser credential", /(?:access_token|id_token|refresh_token|cognito:groups)/i]
  ];
  const networkApis = /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(|sendBeacon\s*\(/;
  for (const asset of assets) {
    const url = new URL(`../docs/${asset}`, import.meta.url);
    const metadata = await lstat(url);
    assert.ok(metadata.isFile() && !metadata.isSymbolicLink(), `${asset} is a regular file`);
    const payload = await readFile(url);
    payloads.push(payload);
    if (asset === ".nojekyll") continue;
    const content = payload.toString("utf8");
    for (const [label, pattern] of forbiddenText) {
      assert.doesNotMatch(content, pattern, `${asset} contains no ${label}`);
    }
    if (["app.js", "demo-model.js"].includes(asset)) {
      assert.doesNotMatch(content, networkApis, `${asset} contains no network API`);
    }
  }
  const totalBytes = payloads.reduce((total, payload) => total + payload.byteLength, 0);
  assert.ok(totalBytes <= 128 * 1024, `static demo is ${totalBytes} bytes`);
});

test("self-hosting template is private, bounded, and has no provisioned compute", async () => {
  const template = await readFile(new URL("../deployment/static-site.template.yaml", import.meta.url), "utf8");

  assert.match(template, /AWS::CloudFront::Distribution/);
  assert.match(template, /AWS::CloudFront::OriginAccessControl/);
  assert.match(template, /OriginAccessControlOriginType: s3/);
  assert.match(template, /SigningBehavior: always/);
  assert.match(template, /Service: cloudfront\.amazonaws\.com/);
  assert.match(template, /AWS:SourceArn:.*distribution\/\$\{SiteDistribution\}/);
  assert.match(template, /BlockPublicAcls: true/);
  assert.match(template, /RestrictPublicBuckets: true/);
  assert.match(template, /ObjectOwnership: BucketOwnerEnforced/);
  assert.match(template, /DaysAfterInitiation: 1/);
  assert.match(template, /ViewerProtocolPolicy: redirect-to-https/);
  assert.match(template, /PriceClass: PriceClass_100/);
  assert.match(template, /connect-src 'none'/);
  assert.match(template, /DeletionPolicy: Delete/);
  assert.doesNotMatch(template, /AWS::(?:EC2|RDS|Lambda|NATGateway|Logs)::/);
  assert.doesNotMatch(template, /VersioningConfiguration:[\s\S]*Status: Enabled/);
});

test("demo provenance binds the planned public release to every static asset", async () => {
  const provenance = JSON.parse(await readFile(new URL("../demo-provenance.json", import.meta.url), "utf8"));
  const expectedAssets = [".nojekyll", "app.js", "demo-model.js", "favicon.svg", "index.html", "styles.css"];

  assert.deepEqual(Object.keys(provenance).sort(), [
    "files",
    "repository",
    "schema_version",
    "source_path",
    "source_url",
    "tag",
    "version"
  ]);
  assert.equal(provenance.schema_version, 1);
  assert.equal(provenance.repository, "categori-se/studio-examples");
  assert.equal(provenance.tag, "v0.4.0");
  assert.equal(provenance.version, "0.4.0");
  assert.equal(provenance.source_path, "docs");
  assert.equal(
    provenance.source_url,
    "https://github.com/categori-se/studio-examples/tree/v0.4.0/docs"
  );
  assert.deepEqual(Object.keys(provenance.files).sort(), expectedAssets);

  for (const filename of expectedAssets) {
    const content = await readFile(new URL(`../docs/${filename}`, import.meta.url));
    const digest = `sha256:${createHash("sha256").update(content).digest("hex")}`;
    assert.equal(provenance.files[filename], digest, `${filename} provenance`);
  }

  const html = await readFile(new URL("../docs/index.html", import.meta.url), "utf8");
  assert.ok(html.includes(`href="${provenance.source_url}"`));
});

test("published verification compares each browser-served asset to tagged provenance", async () => {
  const expectedAssets = await verifyLocalDemo({tag: "v0.4.0"});
  const originalFetch = globalThis.fetch;
  let driftApp = false;
  globalThis.fetch = async (request) => {
    const filename = new URL(request).pathname.split("/").at(-1);
    const content = driftApp && filename === "app.js"
      ? Buffer.from("drift")
      : await readFile(new URL(`../docs/${filename}`, import.meta.url));
    return new Response(content, {status: 200});
  };
  try {
    const options = {
      url: "https://categori-se.github.io/studio-examples/",
      releaseSha: "a".repeat(40),
      expectedAssets,
      attempts: 1,
      delayMs: 0
    };
    await assert.doesNotReject(() => verifyPublishedDemo(options));
    driftApp = true;
    await assert.rejects(() => verifyPublishedDemo(options), /app\.js still serves a different digest/);
    await assert.rejects(
      () => verifyPublishedDemo({...options, url: "https://example.invalid/studio-examples/"}),
      /published demo URL must equal/
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("public workflows scan first and Pages deploys only an exact tag/SHA", async () => {
  const ci = await readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
  assert.ok(ci.includes("npm run check:public-tree --prefix studio-examples"));
  assert.ok(ci.indexOf("check:public-tree") < ci.indexOf("npm install"));

  const pages = await readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");
  for (const required of [
    'test "$GITHUB_REF" = "refs/heads/main"',
    'ref: ${{ inputs.release_sha }}',
    'rev-parse "${RELEASE_TAG}^{commit}"',
    'merge-base --is-ancestor "$RELEASE_SHA" refs/remotes/origin/main',
    "node release/scripts/check-public-tree.mjs",
    "node release/scripts/verify-demo-assets.mjs",
    "actions/configure-pages@45bfe0192ca1faeb007ade9deae92b16b8254a0d",
    "actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9",
    "actions/deploy-pages@cd2ce8fcbc39b97be8ca5fce6e763baed58fa128",
    "upload-artifact@bbbca2ddaa5d8feaa63e36b76fdaad77386f024f v7.0.0/node24"
  ]) assert.ok(pages.includes(required), required);
  assert.doesNotMatch(pages, /main:\/docs/);
});

test("public quick starts use the exact v0.4.0 dependency graph", async () => {
  for (const relative of ["../README.md", "../docs/index.html"]) {
    const content = await readFile(new URL(relative, import.meta.url), "utf8");
    assert.equal((content.match(/git clone --branch v0\.4\.0 --depth 1/g) || []).length, 3);
    assert.doesNotMatch(content, /git clone https:\/\/github\.com\/categori-se\/studio-/);
  }
});

test("every displayed project manifest, rubric, and release matches the public contracts", () => {
  for (const project of projects) {
    const manifest = parseStudioDocument(manifestFor(project), {filename: `${project.id}.yaml`});
    assert.deepEqual(validateProject(manifest), [], `${project.id} generated manifest`);

    const rubric = rubricFor(project);
    if (project.evaluation) assert.doesNotThrow(() => assertEvaluationRubric(rubric), `${project.id} displayed rubric`);
    else assert.equal(rubric, null);

    if (project.release) assert.doesNotThrow(() => assertReleaseRecord(project.release), `${project.id} displayed release`);
  }
});

test("only a passing evaluation and contract-bound succeeded release produce released posture", () => {
  const released = projects.find((project) => project.id === "evidence-review");
  assert.equal(evaluationPassed(released.evaluation), true);
  assert.deepEqual(projectStage(released), {label: "released", dot: "ready"});
  assert.equal(projectPosture(released).label, "Released");
  assert.equal(projectReleasePosture(released).state, "verified");
  assert.equal(lineageFor(released).find((stage) => stage.code === "R").state, "verified");
  assert.deepEqual(lineageFor(released).map((stage) => stage.code), ["B", "S", "F", "P", "E", "D", "R", "H"]);
  assert.equal(lineageFor(released).find((stage) => stage.code === "H").state, "verified");

  const failed = {...released, release: {...released.release, result: "FAILED"}};
  assert.equal(releasePosture(failed.release).state, "failed");
  assert.equal(projectStage(failed).label, "release failed");
  assert.equal(projectPosture(failed).label, "Release failed");
  assert.equal(lineageFor(failed).find((stage) => stage.code === "R").state, "failed");

  const rolledBack = {...released, release: {...released.release, result: "ROLLED_BACK"}};
  assert.equal(releasePosture(rolledBack.release).state, "rolled-back");
  assert.equal(projectStage(rolledBack).label, "rolled back");
  assert.equal(projectPosture(rolledBack).label, "Rolled back");
  assert.equal(lineageFor(rolledBack).find((stage) => stage.code === "R").state, "rolled-back");

  const belowThreshold = {
    ...released,
    evaluation: {...released.evaluation, status: "Passed", score: released.evaluation.passing - 0.1}
  };
  assert.equal(evaluationPassed(belowThreshold.evaluation), false);
  assert.equal(lineageFor(belowThreshold).find((stage) => stage.code === "E").state, "failed");
  assert.equal(projectReleasePosture(belowThreshold).state, "incomplete");
  assert.equal(projectPosture(belowThreshold).label, "Record gap");
  assert.notEqual(projectStage(belowThreshold).label, "released");

  const pendingDecision = {
    ...released,
    decision: {status: "Pending", actor: null, outcome: null, at: null}
  };
  assert.equal(projectReleasePosture(pendingDecision).state, "incomplete");
  assert.equal(projectReleasePosture(pendingDecision).label, "Succeeded · expert decision gap");
  assert.notEqual(projectStage(pendingDecision).label, "released");

  const unbound = structuredClone(released);
  unbound.evidenceChain.reviewDecision.resultSha256 = "0".repeat(64);
  assert.equal(evidenceChainPosture(unbound).verified, false);
  assert.equal(projectReleasePosture(unbound).state, "incomplete");
  assert.equal(projectPosture(unbound).label, "Record gap");
  assert.notEqual(projectStage(unbound).label, "released");
});
