export type FieldType = "str" | "u256" | "bool";
export type FieldSpec = { name: string; label: string; type: FieldType };
export type WriteAction = { name: string; label: string; description: string; fields: readonly FieldSpec[] };
export type ReadAction = { name: string; label: string; fields: readonly FieldSpec[] };

export const appSpec = {
  "brand": "QuotaWake",
  "kicker": "Traceable fishery quota",
  "headline": "Every catch leaves a wake.",
  "description": "Bind authorized vessel controllers and quota owners, transfer traceable lots, and reconcile authenticated landing records with GenLayer validators.",
  "workspace": "Live tidefield",
  "workspaceCopy": "Navigate seasons, lots, voyages, crossings, landings, and final quota debits as one continuous maritime journal.",
  "primary": "Launch tidefield",
  "reference": "Flowing Waves motion field",
  "design": "full-bleed ocean observatory",
  "mediaType": "video",
  "media": "/reference/flowing-waves.mp4",
  "mediaAlt": "Animated flowing ocean field",
  "steps": [
    [
      "SEASON",
      "Issue the quota",
      "Register authority sources, bind vessels, and allocate owner-held lots."
    ],
    [
      "VOYAGE",
      "Trace the wake",
      "Require owner acceptance, controller authorization, and ordered crossings."
    ],
    [
      "LANDING",
      "Post the debit",
      "Fetch issuer-bound evidence and debit only the authorized vessel ledger."
    ]
  ],
  "stats": [
    [
      "11",
      "maritime writes"
    ],
    [
      "5",
      "ledger lenses"
    ],
    [
      "Live",
      "zone chronology"
    ]
  ]
} as const;

export const writeActions = [
  {
    "name": "configure_evidence_authorities",
    "label": "Configure authorities",
    "description": "Registrar: lock trusted HTTPS prefixes for vessel, policy, permit, and landing records.",
    "fields": [
      { "name": "vessel_registry_prefix", "label": "Vessel registry prefix", "type": "str" },
      { "name": "policy_prefix", "label": "Policy source prefix", "type": "str" },
      { "name": "permit_prefix", "label": "Permit source prefix", "type": "str" },
      { "name": "landing_prefix", "label": "Landing source prefix", "type": "str" }
    ]
  },
  {
    "name": "register_vessel",
    "label": "Register vessel",
    "description": "Registrar: bind a vessel to its controller and quota owner using an authenticated registry record.",
    "fields": [
      { "name": "vessel_id", "label": "Vessel ID", "type": "str" },
      { "name": "controller", "label": "Controller wallet", "type": "str" },
      { "name": "quota_owner", "label": "Quota owner wallet", "type": "str" },
      { "name": "registry_url", "label": "Registry record URL", "type": "str" },
      { "name": "registry_sha256", "label": "Registry SHA-256", "type": "str" }
    ]
  },
  {
    "name": "establish_quota_season",
    "label": "Establish season",
    "description": "Open a species quota under a public policy.",
    "fields": [
      {
        "name": "season_id",
        "label": "Season ID",
        "type": "str"
      },
      {
        "name": "species_code",
        "label": "Species code",
        "type": "str"
      },
      {
        "name": "policy_url",
        "label": "Policy URL",
        "type": "str"
      },
      {
        "name": "policy_sha256",
        "label": "Policy SHA-256",
        "type": "str"
      },
      {
        "name": "total_units",
        "label": "Total quota units",
        "type": "u256"
      }
    ]
  },
  {
    "name": "issue_quota_lot",
    "label": "Issue quota lot",
    "description": "Assign quota units to a vessel.",
    "fields": [
      {
        "name": "season_id",
        "label": "Season ID",
        "type": "str"
      },
      {
        "name": "lot_id",
        "label": "Lot ID",
        "type": "str"
      },
      {
        "name": "vessel_id",
        "label": "Vessel ID",
        "type": "str"
      },
      {
        "name": "units",
        "label": "Quota units",
        "type": "u256"
      }
    ]
  },
  {
    "name": "offer_quota_transfer",
    "label": "Offer transfer",
    "description": "Offer part of a lot to another vessel.",
    "fields": [
      {
        "name": "lot_id",
        "label": "Lot ID",
        "type": "str"
      },
      {
        "name": "offer_id",
        "label": "Offer ID",
        "type": "str"
      },
      {
        "name": "destination_vessel",
        "label": "Destination vessel",
        "type": "str"
      },
      {
        "name": "units",
        "label": "Units",
        "type": "u256"
      }
    ]
  },
  {
    "name": "accept_quota_transfer",
    "label": "Accept transfer",
    "description": "Accept an offer into a child lot.",
    "fields": [
      {
        "name": "offer_id",
        "label": "Offer ID",
        "type": "str"
      },
      {
        "name": "child_lot_id",
        "label": "Child lot ID",
        "type": "str"
      }
    ]
  },
  {
    "name": "depart_voyage",
    "label": "Depart voyage",
    "description": "Open a permitted fishing voyage.",
    "fields": [
      {
        "name": "voyage_id",
        "label": "Voyage ID",
        "type": "str"
      },
      {
        "name": "season_id",
        "label": "Season ID",
        "type": "str"
      },
      {
        "name": "vessel_id",
        "label": "Vessel ID",
        "type": "str"
      },
      {
        "name": "permit_url",
        "label": "Permit URL",
        "type": "str"
      },
      {
        "name": "permit_sha256",
        "label": "Permit SHA-256",
        "type": "str"
      }
    ]
  },
  {
    "name": "log_zone_crossing",
    "label": "Log zone crossing",
    "description": "Record entry to or exit from a managed zone.",
    "fields": [
      {
        "name": "voyage_id",
        "label": "Voyage ID",
        "type": "str"
      },
      {
        "name": "zone_code",
        "label": "Zone code",
        "type": "str"
      },
      {
        "name": "entered",
        "label": "Entered zone",
        "type": "bool"
      },
      {
        "name": "observed_at",
        "label": "Observed Unix time",
        "type": "u256"
      }
    ]
  },
  {
    "name": "declare_catch_landing",
    "label": "Declare landing",
    "description": "Publish catch units and landing evidence.",
    "fields": [
      {
        "name": "voyage_id",
        "label": "Voyage ID",
        "type": "str"
      },
      {
        "name": "declared_units",
        "label": "Declared units",
        "type": "u256"
      },
      {
        "name": "landing_url",
        "label": "Landing evidence URL",
        "type": "str"
      },
      {
        "name": "landing_sha256",
        "label": "Landing SHA-256",
        "type": "str"
      }
    ]
  },
  {
    "name": "reconcile_landing_debit",
    "label": "Reconcile landing",
    "description": "Ask validators to reconcile voyage evidence.",
    "fields": [
      {
        "name": "voyage_id",
        "label": "Voyage ID",
        "type": "str"
      }
    ]
  },
  {
    "name": "post_quota_debit",
    "label": "Post quota debit",
    "description": "Commit the reconciled debit to the season.",
    "fields": [
      {
        "name": "voyage_id",
        "label": "Voyage ID",
        "type": "str"
      }
    ]
  }
] as const satisfies readonly WriteAction[];
export const readActions = [
  {
    "name": "read_vessel_authorization",
    "label": "Vessel authorization",
    "fields": [
      { "name": "vessel_id", "label": "Vessel ID", "type": "str" }
    ]
  },
  {
    "name": "read_transfer_offer",
    "label": "Transfer offer",
    "fields": [
      { "name": "offer_id", "label": "Offer ID", "type": "str" }
    ]
  },
  {
    "name": "read_vessel_quota",
    "label": "Vessel quota",
    "fields": [
      {
        "name": "season_id",
        "label": "Season ID",
        "type": "str"
      },
      {
        "name": "vessel_id",
        "label": "Vessel ID",
        "type": "str"
      }
    ]
  },
  {
    "name": "read_voyage_journal",
    "label": "Voyage journal",
    "fields": [
      {
        "name": "voyage_id",
        "label": "Voyage ID",
        "type": "str"
      }
    ]
  },
  {
    "name": "read_season_ledger",
    "label": "Season ledger",
    "fields": [
      {
        "name": "season_id",
        "label": "Season ID",
        "type": "str"
      }
    ]
  }
] as const satisfies readonly ReadAction[];
