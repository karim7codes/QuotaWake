import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const deployment = JSON.parse(fs.readFileSync(path.join(root, "deployment.json"), "utf8"));

test("QuotaWake V2 schema is available on Studionet", async () => {
  const response = await fetch(deployment.rpcUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "gen_getContractSchema", params: [deployment.contractAddress] }) });
  assert.equal(response.ok, true);
  const payload = await response.json();
  assert.equal(payload.error, undefined);
  const text = JSON.stringify(payload.result);
  assert.match(text, /establish_quota_season/);
  assert.match(text, /issue_quota_lot/);
  assert.match(text, /offer_quota_transfer/);
  assert.match(text, /accept_quota_transfer/);
  assert.match(text, /depart_voyage/);
  assert.match(text, /log_zone_crossing/);
  assert.match(text, /declare_catch_landing/);
  assert.match(text, /reconcile_landing_debit/);
  assert.match(text, /post_quota_debit/);
  assert.match(text, /read_vessel_quota/);
  assert.match(text, /read_voyage_journal/);
  assert.match(text, /read_season_ledger/);
});
