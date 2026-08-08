import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const contract = read("contracts/QuotaWake.py");
const experience = read("src/components/tide-experience.tsx");
const landing = read("src/components/quotawake-landing.tsx");
const live = read("src/lib/live-contract.ts");
const spec = read("src/lib/domain-spec.ts");
const deployment = JSON.parse(read("deployment.json"));

test("the V2 contract surface is fully represented", () => {
  const publicNames = [...contract.matchAll(/@gl\.public\.(?:write|view)\n\s+def ([a-z0-9_]+)\(/g)].map((match) => match[1]);
  assert.equal(publicNames.length, 12);
  for (const name of publicNames) assert.match(spec, new RegExp(`["']${name}["']`));
  assert.ok(["deployed_verified_v2", "smoke_verified"].includes(deployment.status));
  assert.equal(deployment.sourceHash, "d45c7626807d0c9364b66eb4163a32edcc8e1fae60b9f6a4208010b833e1403a");
  assert.match(deployment.contractAddress, /^0x[0-9a-fA-F]{40}$/);
});

test("the app is one complete English route", () => {
  const appRoot = path.join(root, "src", "app");
  const pages = [];
  const visit = (directory) => { for (const entry of fs.readdirSync(directory, { withFileTypes: true })) { const target = path.join(directory, entry.name); if (entry.isDirectory()) visit(target); else if (entry.name === "page.tsx") pages.push(target); } };
  visit(appRoot);
  assert.deepEqual(
    pages.map((page) => path.relative(appRoot, page)).sort(),
    [path.join("app", "page.tsx"), "page.tsx"],
  );
  assert.doesNotMatch(experience, /["'`]\/contract["'`]/);
  assert.doesNotMatch(experience, /\?mode=/);
  assert.match(experience, /className="[^"]*brand" href="(?:\.\.\/|\.\/|\/)"/);
  assert.doesNotMatch(experience, /aria-label="Primary navigation"/);
  assert.doesNotMatch(experience, /href=["'`]#/);
  assert.doesNotMatch(landing, /<nav/);
});

test("wallet, source reference, and finality are explicit", () => {
  assert.match(experience, /ConnectButton/);
  assert.ok((experience + "\n" + spec).includes("Flowing Waves motion field"));
  assert.match(live, /TransactionStatus\.FINALIZED/);
  assert.match(live, /MAJORITY_AGREE/);
  assert.doesNotMatch(`${experience}\n${live}`, new RegExp(["private" + "Key", "mne" + "monic", "seed" + "Phrase"].join("|")));
});
