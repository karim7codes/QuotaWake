# QuotaWake

QuotaWake is a GenLayer fisheries ledger that preserves quota lineage from a season ceiling through authority-bound vessels, transferable lots, voyages, authenticated landings, and deterministic quota debits.

Live app: https://karim7codes.github.io/QuotaWake/
App route: https://karim7codes.github.io/QuotaWake/app/

## Why GenLayer

The contract does not trust a caller's description of a catch. Validators independently retrieve hash-pinned policy, permit, and landing records from registrar-configured HTTPS authority sources. They compare the fields that control the result—verified units, debit units, and landing class—before the contract can alter quota accounting.

Everything else is deterministic: identity checks, lot custody, transfer acceptance, chronological zone events, evidence replay protection, lot spending, deficits, and conservation totals.

## Security model

- The deployer is the fisheries registrar.
- The registrar configures four trusted source prefixes: vessel registry, policy, permit, and landing authority.
- Only the registrar can bind a vessel ID to its controller wallet and quota-owner wallet.
- Vessel records must come from the configured registry, match an exact SHA-256 digest, identify `QUOTAWAKE-VESSEL-REGISTRY`, and reproduce both wallets.
- Issued lots belong to the registered quota owner, never to the caller that names a vessel.
- Only the current lot owner can offer a transfer. Only the registered owner of the destination vessel can accept it.
- Only the registered controller can depart, log crossings, declare a landing, and post the reconciled debit.
- Permits and landings must come from configured authority sources, use exact SHA-256 digests, contain the expected issuer ID, and match the vessel, season, voyage, species, and units.
- A landing evidence record is single-use.
- Posting consumes only lots owned by the registered owner of the voyage's vessel. Uncovered units remain visible as a deficit.

## Contract lifecycle

1. `configure_evidence_authorities` locks the authority source prefixes.
2. `register_vessel` binds vessel, controller, and quota owner to a fetched registry record.
3. `establish_quota_season` verifies the policy source and opens a hard issuance ceiling.
4. `issue_quota_lot` creates an owner-held lot for a registered vessel.
5. `offer_quota_transfer` and `accept_quota_transfer` create an accepted child lot while preserving lineage.
6. `depart_voyage`, `log_zone_crossing`, and `declare_catch_landing` build the authorized voyage journal.
7. `reconcile_landing_debit` runs GenLayer consensus over the authenticated evidence set.
8. `post_quota_debit` consumes eligible lots deterministically and records any deficit.

Five views expose vessel authorization, transfer acceptance, vessel quota, voyage journal, and season conservation.

## Verified StudioNet deployment

| Item | Value |
| --- | --- |
| Network | GenLayer StudioNet (`61999`) |
| Contract | `0x073a115839e7Bd038457b15dE9e2cc4dF5AE6937` |
| Explorer | `https://explorer-studio.genlayer.com/address/0x073a115839e7Bd038457b15dE9e2cc4dF5AE6937` |
| Contract SHA-256 | `fc9625e850bac52a745860465c30efb8c9bf1fef1181b4b48bb031239c988798` |
| Lifecycle | 12 writes, 5 views, final state `POSTED` |

Deployment and lifecycle evidence is kept outside the repository.

## Reproduce locally

```powershell
npm install
npm run typecheck
npm test
npm run build
```

Validate the intelligent contract and run the direct suite:

```powershell
python -m pip install -r requirements.txt
genvm-lint check contracts/QuotaWake.py --json
python -m pytest tests/direct -q
```

Check the deployed schema:

```powershell
npm run test:studionet
```

The full deployment script reads `GENLAYER_PRIVATE_KEY` from the environment. It never stores a private key in source or artifacts.

## Frontend

The responsive Next.js interface uses RainbowKit and wagmi. The connected browser wallet is bridged into the GenLayer write client, signs the selected role-specific transaction, waits for `FINALIZED`, checks `MAJORITY_AGREE`, and rejects failed leader execution. Run it locally with `npm run dev` and open `http://localhost:4413`.

## Repository layout

```text
contracts/              GenLayer contract
scripts/                StudioNet lifecycle runner
src/                    Next.js application
tests/direct/           authorization and accounting regressions
tests/source.test.mjs   repository and client safeguards
tests/studionet.test.mjs deployed schema verification
```
