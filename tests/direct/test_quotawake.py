import hashlib
import json
from pathlib import Path


CONTRACT = str(Path(__file__).resolve().parents[2] / "contracts" / "QuotaWake.py")
REGISTRY_PREFIX = "https://authority.example/vessels/"
POLICY_PREFIX = "https://authority.example/policies/"
PERMIT_PREFIX = "https://authority.example/permits/"
LANDING_PREFIX = "https://authority.example/landings/"


def sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def address(value) -> str:
    if isinstance(value, (bytes, bytearray)):
        return "0x" + bytes(value).hex()
    return str(value).lower()


def mock_text(direct_vm, token: str, body: str) -> None:
    direct_vm.mock_web(rf".*{token}.*", {"status": 200, "body": body})


def vessel_record(vessel_id: str, controller, quota_owner) -> str:
    return json.dumps(
        {
            "issuer_id": "QUOTAWAKE-VESSEL-REGISTRY",
            "vessel_id": vessel_id,
            "controller": address(controller),
            "quota_owner": address(quota_owner),
            "status": "ACTIVE",
        },
        separators=(",", ":"),
        sort_keys=True,
    )


def permit_record(vessel_id: str, season_id: str) -> str:
    return json.dumps(
        {
            "issuer_id": "QUOTAWAKE-PERMIT-AUTHORITY",
            "permit_id": "PERMIT-" + vessel_id,
            "vessel_id": vessel_id,
            "season_id": season_id,
            "status": "ACTIVE",
        },
        separators=(",", ":"),
        sort_keys=True,
    )


def landing_record(voyage_id: str, vessel_id: str, season_id: str, units: int) -> str:
    return json.dumps(
        {
            "issuer_id": "QUOTAWAKE-LANDING-AUTHORITY",
            "landing_id": "LANDING-" + voyage_id,
            "voyage_id": voyage_id,
            "vessel_id": vessel_id,
            "season_id": season_id,
            "species_code": "COD",
            "declared_units": units,
            "landed_units": units,
            "observed_at": 1900000100,
            "status": "FINAL",
        },
        separators=(",", ":"),
        sort_keys=True,
    )


def deploy_and_configure(direct_vm, direct_deploy, registrar):
    direct_vm.sender = registrar
    contract = direct_deploy(CONTRACT)
    contract.configure_evidence_authorities(
        REGISTRY_PREFIX, POLICY_PREFIX, PERMIT_PREFIX, LANDING_PREFIX
    )
    return contract


def register_vessel(direct_vm, contract, registrar, vessel_id, controller, owner):
    body = vessel_record(vessel_id, controller, owner)
    token = vessel_id.lower()
    mock_text(direct_vm, token, body)
    direct_vm.sender = registrar
    contract.register_vessel(
        vessel_id,
        address(controller),
        address(owner),
        REGISTRY_PREFIX + token,
        sha256(body),
    )


def establish_season(direct_vm, contract, registrar, season_id="north-2027"):
    policy = "Official COD quota policy. Debit verified landed units; closures are prohibited."
    mock_text(direct_vm, "cod-policy", policy)
    direct_vm.sender = registrar
    contract.establish_quota_season(
        season_id, "COD", POLICY_PREFIX + "cod-policy", sha256(policy), 1000
    )
    return policy


def test_only_registrar_can_configure_and_register_vessels(
    direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob
):
    direct_vm.sender = direct_owner
    contract = direct_deploy(CONTRACT)
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("Only the fisheries registrar"):
        contract.configure_evidence_authorities(
            REGISTRY_PREFIX, POLICY_PREFIX, PERMIT_PREFIX, LANDING_PREFIX
        )

    direct_vm.sender = direct_owner
    contract.configure_evidence_authorities(
        REGISTRY_PREFIX, POLICY_PREFIX, PERMIT_PREFIX, LANDING_PREFIX
    )
    body = vessel_record("VSL-A", direct_alice, direct_alice)
    mock_text(direct_vm, "vsl-a", body)
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("Only the fisheries registrar"):
        contract.register_vessel(
            "VSL-A", address(direct_alice), address(direct_alice),
            REGISTRY_PREFIX + "vsl-a", sha256(body)
        )


def test_vessel_registry_rejects_untrusted_source_wrong_hash_and_forged_identity(
    direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob
):
    contract = deploy_and_configure(direct_vm, direct_deploy, direct_owner)
    body = vessel_record("VSL-A", direct_alice, direct_alice)
    mock_text(direct_vm, "vsl-a", body)
    with direct_vm.expect_revert("outside the registered authority source"):
        contract.register_vessel(
            "VSL-A", address(direct_alice), address(direct_alice),
            "https://attacker.example/vsl-a", sha256(body)
        )
    with direct_vm.expect_revert("SHA-256 mismatch"):
        contract.register_vessel(
            "VSL-A", address(direct_alice), address(direct_alice),
            REGISTRY_PREFIX + "vsl-a", "0" * 64
        )
    with direct_vm.expect_revert("controller does not match"):
        contract.register_vessel(
            "VSL-A", address(direct_bob), address(direct_alice),
            REGISTRY_PREFIX + "vsl-a", sha256(body)
        )


def test_lot_issuance_uses_registered_quota_owner_and_blocks_impersonation(
    direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob
):
    contract = deploy_and_configure(direct_vm, direct_deploy, direct_owner)
    register_vessel(direct_vm, contract, direct_owner, "VSL-A", direct_alice, direct_alice)
    establish_season(direct_vm, contract, direct_owner)
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("Only the fisheries registrar"):
        contract.issue_quota_lot("north-2027", "forged-lot", "VSL-A", 50)
    direct_vm.sender = direct_owner
    contract.issue_quota_lot("north-2027", "lot-a", "VSL-A", 300)
    quota = contract.read_vessel_quota("north-2027", "VSL-A")
    auth = contract.read_vessel_authorization("VSL-A")
    assert quota["quota_owner"] == address(direct_alice)
    assert quota["lots"][0]["owner"] == address(direct_alice)
    assert auth["controller"] == address(direct_alice)


def test_transfer_requires_current_owner_and_explicit_destination_acceptance(
    direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob, direct_charlie
):
    contract = deploy_and_configure(direct_vm, direct_deploy, direct_owner)
    register_vessel(direct_vm, contract, direct_owner, "VSL-A", direct_alice, direct_alice)
    register_vessel(direct_vm, contract, direct_owner, "VSL-B", direct_bob, direct_bob)
    establish_season(direct_vm, contract, direct_owner)
    direct_vm.sender = direct_owner
    contract.issue_quota_lot("north-2027", "lot-a", "VSL-A", 300)

    direct_vm.sender = direct_charlie
    with direct_vm.expect_revert("authenticated quota owner"):
        contract.offer_quota_transfer("lot-a", "forged-offer", "VSL-B", 80)
    direct_vm.sender = direct_alice
    contract.offer_quota_transfer("lot-a", "offer-1", "VSL-B", 80)
    direct_vm.sender = direct_charlie
    with direct_vm.expect_revert("destination quota owner"):
        contract.accept_quota_transfer("offer-1", "lot-b")

    # No units move until the exact registered recipient accepts.
    assert contract.read_vessel_quota("north-2027", "VSL-A")["available_units"] == 300
    direct_vm.sender = direct_bob
    contract.accept_quota_transfer("offer-1", "lot-b")
    offer = contract.read_transfer_offer("offer-1")
    source = contract.read_vessel_quota("north-2027", "VSL-A")
    destination = contract.read_vessel_quota("north-2027", "VSL-B")
    assert offer["state"] == "ACCEPTED"
    assert source["available_units"] == 220
    assert destination["available_units"] == 80
    assert destination["lots"][0]["lineage_parent"] == "lot-a"
    assert source["available_units"] + destination["available_units"] == 300


def test_only_registered_controller_can_operate_voyage_and_evidence_is_authenticated(
    direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob
):
    contract = deploy_and_configure(direct_vm, direct_deploy, direct_owner)
    register_vessel(direct_vm, contract, direct_owner, "VSL-A", direct_alice, direct_bob)
    establish_season(direct_vm, contract, direct_owner)
    permit = permit_record("VSL-A", "north-2027")
    mock_text(direct_vm, "permit-a", permit)
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("registered vessel controller"):
        contract.depart_voyage(
            "voyage-1", "north-2027", "VSL-A", PERMIT_PREFIX + "permit-a", sha256(permit)
        )
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("outside the registered authority source"):
        contract.depart_voyage(
            "voyage-1", "north-2027", "VSL-A", "https://caller.example/permit-a", sha256(permit)
        )
    contract.depart_voyage(
        "voyage-1", "north-2027", "VSL-A", PERMIT_PREFIX + "permit-a", sha256(permit)
    )
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("vessel controller"):
        contract.log_zone_crossing("voyage-1", "ZONE-1", True, 1900000000)


def test_zone_order_landing_binding_and_replay_protection(
    direct_vm, direct_deploy, direct_owner, direct_alice
):
    contract = deploy_and_configure(direct_vm, direct_deploy, direct_owner)
    register_vessel(direct_vm, contract, direct_owner, "VSL-A", direct_alice, direct_alice)
    establish_season(direct_vm, contract, direct_owner)
    permit = permit_record("VSL-A", "north-2027")
    landing = landing_record("voyage-1", "VSL-A", "north-2027", 75)
    mock_text(direct_vm, "permit-a", permit)
    mock_text(direct_vm, "landing-1", landing)
    direct_vm.sender = direct_alice
    contract.depart_voyage("voyage-1", "north-2027", "VSL-A", PERMIT_PREFIX + "permit-a", sha256(permit))
    contract.log_zone_crossing("voyage-1", "ZONE-1", True, 1900000000)
    with direct_vm.expect_revert("chronological"):
        contract.log_zone_crossing("voyage-1", "ZONE-2", False, 1899999999)
    with direct_vm.expect_revert("outside the registered authority source"):
        contract.declare_catch_landing("voyage-1", 75, "https://caller.example/landing-1", sha256(landing))
    contract.declare_catch_landing("voyage-1", 75, LANDING_PREFIX + "landing-1", sha256(landing))

    # The same authority record cannot be attached to another voyage.
    contract.depart_voyage("voyage-2", "north-2027", "VSL-A", PERMIT_PREFIX + "permit-a", sha256(permit))
    with direct_vm.expect_revert("already used"):
        contract.declare_catch_landing("voyage-2", 75, LANDING_PREFIX + "landing-1", sha256(landing))


def test_full_reconciliation_and_debit_preserve_authorization_and_accounting(
    direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob
):
    contract = deploy_and_configure(direct_vm, direct_deploy, direct_owner)
    register_vessel(direct_vm, contract, direct_owner, "VSL-A", direct_alice, direct_alice)
    establish_season(direct_vm, contract, direct_owner)
    direct_vm.sender = direct_owner
    contract.issue_quota_lot("north-2027", "lot-a", "VSL-A", 120)
    permit = permit_record("VSL-A", "north-2027")
    landing = landing_record("voyage-9", "VSL-A", "north-2027", 75)
    policy = "Official COD quota policy. Debit verified landed units; closures are prohibited."
    mock_text(direct_vm, "permit-a", permit)
    mock_text(direct_vm, "landing-9", landing)
    mock_text(direct_vm, "cod-policy", policy)
    direct_vm.mock_llm(
        r".*landing reconciler.*",
        json.dumps({"verified_units": 75, "debit_units": 75, "zone_flags": [], "landing_class": "MATCH", "explanation": "Authenticated scale receipt matches."}),
    )
    direct_vm.sender = direct_alice
    contract.depart_voyage("voyage-9", "north-2027", "VSL-A", PERMIT_PREFIX + "permit-a", sha256(permit))
    contract.log_zone_crossing("voyage-9", "ZONE-4", True, 1900000000)
    contract.declare_catch_landing("voyage-9", 75, LANDING_PREFIX + "landing-9", sha256(landing))
    contract.reconcile_landing_debit("voyage-9")

    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("registered vessel controller"):
        contract.post_quota_debit("voyage-9")
    direct_vm.sender = direct_alice
    contract.post_quota_debit("voyage-9")

    journal = contract.read_voyage_journal("voyage-9")
    quota = contract.read_vessel_quota("north-2027", "VSL-A")
    season = contract.read_season_ledger("north-2027")
    assert journal["voyage"]["state"] == "POSTED"
    assert journal["debit_journal"]["entries"] == [{"lot_id": "lot-a", "units": 75}]
    assert quota["available_units"] == 45
    assert season["issued_units"] == 120
    assert season["debited_units"] == 75
    assert quota["available_units"] + season["debited_units"] == season["issued_units"]
