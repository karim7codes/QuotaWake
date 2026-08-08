import json
from pathlib import Path


CONTRACT = str(Path(__file__).resolve().parents[2] / "contracts" / "QuotaWake.py")


def test_quota_lot_transfer_creates_lineage(
    direct_vm,
    direct_deploy,
    direct_alice,
    direct_bob,
):
    direct_vm.sender = direct_alice
    contract = direct_deploy(CONTRACT)
    contract.establish_quota_season(
        "north-2027", "COD", "https://example.org/cod-policy", 1000
    )
    contract.issue_quota_lot("north-2027", "lot-a", "VSL-A", 300)
    contract.offer_quota_transfer("lot-a", "offer-1", "VSL-B", 80)
    with direct_vm.prank(direct_bob):
        contract.accept_quota_transfer("offer-1", "lot-b")

    vessel_a = contract.read_vessel_quota("north-2027", "VSL-A")
    vessel_b = contract.read_vessel_quota("north-2027", "VSL-B")
    assert vessel_a["available_units"] == 220
    assert vessel_b["available_units"] == 80
    assert vessel_b["lots"][0]["lineage_parent"] == "lot-a"


def test_landing_reconciliation_debits_vessel_lots(
    direct_vm,
    direct_deploy,
    direct_alice,
):
    direct_vm.sender = direct_alice
    contract = direct_deploy(CONTRACT)
    contract.establish_quota_season(
        "south-2027", "HAKE", "https://example.org/hake-policy", 500
    )
    contract.issue_quota_lot("south-2027", "lot-hake", "VSL-H", 120)
    contract.depart_voyage(
        "voyage-9",
        "south-2027",
        "VSL-H",
        "https://example.org/permit-vsl-h",
    )
    contract.log_zone_crossing("voyage-9", "ZONE-4", True, 1900000000)
    contract.declare_catch_landing(
        "voyage-9", 75, "https://example.org/landing-voyage-9"
    )

    direct_vm.mock_web(
        r".*hake-policy.*",
        {"status": 200, "body": "Hake landings debit verified landed weight."},
    )
    direct_vm.mock_web(
        r".*permit-vsl-h.*",
        {"status": 200, "body": "VSL-H is permitted for ZONE-4."},
    )
    direct_vm.mock_web(
        r".*landing-voyage-9.*",
        {"status": 200, "body": "Certified scale receipt: 75 units of hake."},
    )
    direct_vm.mock_llm(
        r".*landing reconciler.*",
        json.dumps(
            {
                "verified_units": 75,
                "debit_units": 75,
                "zone_flags": [],
                "landing_class": "MATCH",
                "explanation": "Scale receipt and declaration match.",
            }
        ),
    )
    contract.reconcile_landing_debit("voyage-9")
    contract.post_quota_debit("voyage-9")

    journal = contract.read_voyage_journal("voyage-9")
    balance = contract.read_vessel_quota("south-2027", "VSL-H")
    assert journal["voyage"]["state"] == "POSTED"
    assert journal["debit_journal"]["entries"][0]["units"] == 75
    assert balance["available_units"] == 45
