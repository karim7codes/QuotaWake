# QuotaWake

QuotaWake keeps a public accounting lineage from a fishery season ceiling to quota lots, transfers, voyages, landings, and the exact lots consumed by each debit.

## Season ledger

The authority establishes a season before issuing quota. Every lot has an owner, remaining units, and lineage. An accepted transfer creates a child lot instead of editing its parent, so allocation history survives every change of custody.

## Voyage journal

A vessel departs, records chronological zone crossings, and declares a catch landing. GenLayer converts the landing evidence into verified and debit units. Posting then consumes the vessel's available lots deterministically; uncovered units become a visible deficit rather than a vague rejection.

The ledger offers **12 public methods: 9 writes and 3 reads**. Writes cover season establishment, issuance, transfer offer and acceptance, departure, crossings, landing, reconciliation, and debit posting. Views expose vessel quota, a voyage journal, and the season ledger.

## Read the wake

QuotaWake does not use a dashboard template. The landing page introduces the public quota lineage, while `/app` turns it into a tidefield with lot inventory, voyage sequence, crossing records, and signing controls. The header identity links back to `/`, and all operational work remains in this single app route.

## Live bearing

The smoke proof established `smoke-season-ms9nuzin`, issued its first lot, and read the resulting `LOT_ISSUED` state from Studionet. Tests verify the twelve-method surface, chronological and ceiling guards, wallet isolation, contract source hash, and finalized majority consensus.

Launch the chart:

```powershell
npm install
npm run typecheck
npm test
npm run test:studionet
npm run build
npm run dev
```

Local harbor: `http://localhost:4413/`.

## Registry coordinates

| Registry item | Value |
| --- | --- |
| Network | GenLayer Studionet (`61999`) |
| Quota contract | `0x80d55b125c54BCfe4Aba50e4cD309C18b91bF634` |
| Fishery wallet | `0xaf4FE3870baCCF72Dc7ec713d0CB7DcF6997e7d3` |
| Deployment transaction | `0x70d0fa32ff7957ba8e0ec9bfad3f17bb35f0b7d88a43bcd716a68fd76bfafac0` |
| Source hash | `d45c7626807d0c9364b66eb4163a32edcc8e1fae60b9f6a4208010b833e1403a` |
| Verification | `smoke_verified` |
