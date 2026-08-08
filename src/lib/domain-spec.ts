export type FieldType = "str" | "u256" | "bool";
export type FieldSpec = { name: string; label: string; type: FieldType };
export type WriteAction = { name: string; label: string; description: string; fields: readonly FieldSpec[] };
export type ReadAction = { name: string; label: string; fields: readonly FieldSpec[] };

export const appSpec = {
  "brand": "QuotaWake",
  "kicker": "Traceable fishery quota",
  "headline": "Every catch leaves a wake.",
  "description": "Issue quota lots, record vessel transfers and zone crossings, then reconcile each landing against the public season ledger with GenLayer validators.",
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
      "Establish species policy and allocate vessel lots."
    ],
    [
      "VOYAGE",
      "Trace the wake",
      "Record transfers, departure, and every zone crossing."
    ],
    [
      "LANDING",
      "Post the debit",
      "Reconcile evidence and debit the season ledger."
    ]
  ],
  "stats": [
    [
      "9",
      "maritime writes"
    ],
    [
      "3",
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
