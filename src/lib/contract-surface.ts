export const contractSurface = {
  layout: "full-bleed ocean observatory",
  composition: "tide-live-tidefield",
  reference: "Flowing Waves motion field",
  methods: [
  {
    "name": "configure_evidence_authorities",
    "readonly": false
  },
  {
    "name": "register_vessel",
    "readonly": false
  },
  {
    "name": "establish_quota_season",
    "readonly": false
  },
  {
    "name": "issue_quota_lot",
    "readonly": false
  },
  {
    "name": "offer_quota_transfer",
    "readonly": false
  },
  {
    "name": "accept_quota_transfer",
    "readonly": false
  },
  {
    "name": "depart_voyage",
    "readonly": false
  },
  {
    "name": "log_zone_crossing",
    "readonly": false
  },
  {
    "name": "declare_catch_landing",
    "readonly": false
  },
  {
    "name": "reconcile_landing_debit",
    "readonly": false
  },
  {
    "name": "post_quota_debit",
    "readonly": false
  },
  {
    "name": "read_vessel_authorization",
    "readonly": true
  },
  {
    "name": "read_transfer_offer",
    "readonly": true
  },
  {
    "name": "read_vessel_quota",
    "readonly": true
  },
  {
    "name": "read_voyage_journal",
    "readonly": true
  },
  {
    "name": "read_season_ledger",
    "readonly": true
  }
]
} as const;
