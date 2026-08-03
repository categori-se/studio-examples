#!/usr/bin/env node

import {createHash} from "node:crypto";
import {lstat, readFile, readdir} from "node:fs/promises";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";

const REPOSITORY = "categori-se/studio-examples";
const PAGES_URL = "https://categori-se.github.io/studio-examples/";
const DEMO_FILES = [".nojekyll", "app.js", "demo-model.js", "favicon.svg", "index.html", "styles.css"];
const PUBLISHED_FILES = DEMO_FILES.filter((filename) => filename !== ".nojekyll");
const decoder = new TextDecoder("utf-8", {fatal: true});

function digest(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

async function readJson(path) {
  const value = JSON.parse(decoder.decode(await readFile(path)));
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${path} must contain a JSON object`);
  }
  return value;
}

export async function verifyLocalDemo({
  root = resolve(dirname(fileURLToPath(import.meta.url)), ".."),
  tag
} = {}) {
  if (!/^v\d+\.\d+\.\d+$/.test(tag || "")) {
    throw new Error("tag must be an exact semantic-version release such as v0.4.0");
  }

  const packageMetadata = await readJson(join(root, "package.json"));
  const provenance = await readJson(join(root, "demo-provenance.json"));
  const expectedSourceUrl = `https://github.com/${REPOSITORY}/tree/${tag}/docs`;
  const expectedValues = {
    schema_version: 1,
    repository: REPOSITORY,
    tag,
    version: tag.slice(1),
    source_path: "docs",
    source_url: expectedSourceUrl
  };
  if (Object.keys(provenance).sort().join("\n") !==
      ["files", "repository", "schema_version", "source_path", "source_url", "tag", "version"].join("\n")) {
    throw new Error("demo-provenance.json fields do not match the reviewed schema");
  }
  if (packageMetadata.name !== "@categori/studio-examples" || packageMetadata.version !== tag.slice(1)) {
    throw new Error("package metadata does not match the requested release tag");
  }
  for (const [field, expected] of Object.entries(expectedValues)) {
    if (provenance[field] !== expected) throw new Error(`demo provenance ${field} must equal ${JSON.stringify(expected)}`);
  }
  if (!provenance.files || typeof provenance.files !== "object" || Array.isArray(provenance.files) ||
      Object.keys(provenance.files).sort().join("\n") !== DEMO_FILES.join("\n")) {
    throw new Error("demo provenance must name exactly the six reviewed static assets");
  }

  const docsRoot = join(root, "docs");
  const entries = await readdir(docsRoot, {withFileTypes: true});
  if (entries.map((entry) => entry.name).sort().join("\n") !== DEMO_FILES.join("\n")) {
    throw new Error("docs must contain exactly the six provenance-bound static assets");
  }

  const assets = new Map();
  for (const filename of DEMO_FILES) {
    const path = join(docsRoot, filename);
    const metadata = await lstat(path);
    if (!metadata.isFile() || metadata.isSymbolicLink()) throw new Error(`${filename} must be a regular, non-symbolic-link file`);
    const content = await readFile(path);
    const actualDigest = digest(content);
    if (!/^sha256:[0-9a-f]{64}$/.test(provenance.files[filename]) || provenance.files[filename] !== actualDigest) {
      throw new Error(`${filename} does not match demo-provenance.json`);
    }
    assets.set(filename, actualDigest);
  }

  const indexHtml = decoder.decode(await readFile(join(docsRoot, "index.html")));
  if (!indexHtml.includes(`href="${expectedSourceUrl}"`)) {
    throw new Error("the demo source link is not bound to the requested release tag");
  }
  return assets;
}

function validatedPagesUrl(value) {
  const url = new URL(value);
  const normalizedPath = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
  if (url.protocol !== "https:" || url.hostname !== "categori-se.github.io" ||
      normalizedPath !== "/studio-examples/" || url.username || url.password || url.port || url.search || url.hash) {
    throw new Error(`published demo URL must equal ${PAGES_URL}`);
  }
  return new URL(PAGES_URL);
}

async function fetchPublishedAsset(baseUrl, filename, releaseSha) {
  const url = new URL(filename, baseUrl);
  url.searchParams.set("release", releaseSha);
  const response = await fetch(url, {
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) throw new Error(`${filename} returned HTTP ${response.status}`);
  return digest(Buffer.from(await response.arrayBuffer()));
}

export async function verifyPublishedDemo({url, releaseSha, expectedAssets, attempts = 12, delayMs = 5_000}) {
  const baseUrl = validatedPagesUrl(url);
  if (!/^[0-9a-f]{40}$/.test(releaseSha || "")) throw new Error("release SHA must be exactly 40 lowercase hexadecimal characters");
  let failures = [];
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    failures = (await Promise.all(PUBLISHED_FILES.map(async (filename) => {
      try {
        const actual = await fetchPublishedAsset(baseUrl, filename, releaseSha);
        return actual === expectedAssets.get(filename) ? null : `${filename} still serves a different digest`;
      } catch (error) {
        return error instanceof Error ? error.message : String(error);
      }
    }))).filter(Boolean);
    if (!failures.length) return;
    if (attempt < attempts) await new Promise((resolvePromise) => setTimeout(resolvePromise, delayMs));
  }
  throw new Error(`published demo did not converge to ${releaseSha}: ${failures.join("; ")}`);
}

export function parseArguments(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const option = argv[index];
    const value = argv[index + 1];
    if (!new Set(["--tag", "--sha", "--url"]).has(option) || !value || option.slice(2) in values) {
      throw new Error("usage: verify-demo-assets.mjs --tag vX.Y.Z [--sha COMMIT --url PAGES_URL]");
    }
    values[option.slice(2)] = value;
  }
  if (!values.tag || Boolean(values.sha) !== Boolean(values.url)) {
    throw new Error("provide --tag alone for local verification, or provide --tag, --sha, and --url together");
  }
  return values;
}

async function main() {
  const values = parseArguments(process.argv.slice(2));
  const expectedAssets = await verifyLocalDemo({tag: values.tag});
  if (values.url) await verifyPublishedDemo({url: values.url, releaseSha: values.sha, expectedAssets});
  console.log(values.url
    ? `Published demo assets match ${values.tag} at ${values.sha}.`
    : `Local demo assets match ${values.tag} provenance.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main();
}
