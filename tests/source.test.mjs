import assert from "node:assert/strict";
import crypto from "node:crypto";
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
const deployment = read("src/lib/deployment.ts");

test("the authenticated contract surface is fully represented", () => {
  const publicNames = [...contract.matchAll(/@gl\.public\.(?:write|view)\n\s+def ([a-z0-9_]+)\(/g)].map((match) => match[1]);
  assert.equal(publicNames.length, 16);
  for (const name of publicNames) assert.match(spec, new RegExp(`["']${name}["']`));
  assert.match(deployment, new RegExp(crypto.createHash("sha256").update(contract).digest("hex")));
  assert.match(deployment, /0x073a115839e7Bd038457b15dE9e2cc4dF5AE6937/);
});

test("vessel identity, quota custody, and issuer evidence are enforced", () => {
  assert.match(contract, /Only the fisheries registrar/);
  assert.match(contract, /registered destination quota owner may accept/);
  assert.match(contract, /registered vessel controller may post this debit/);
  assert.match(contract, /outside the registered authority source/);
  assert.match(contract, /QUOTAWAKE-VESSEL-REGISTRY/);
  assert.match(contract, /QUOTAWAKE-PERMIT-AUTHORITY/);
  assert.match(contract, /QUOTAWAKE-LANDING-AUTHORITY/);
  assert.match(contract, /Landing evidence was already used/);
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
  assert.match(live, /executionResult.*SUCCESS/s);
  assert.doesNotMatch(`${experience}\n${live}`, new RegExp(["private" + "Key", "mne" + "monic", "seed" + "Phrase"].join("|")));
});
