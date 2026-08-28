import importlib.util
import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


class CriticalReconciliationTests(unittest.TestCase):
    def test_only_credential_administration_is_founder_gated(self):
        policy = load("data/autonomy_policy.json")
        gates = set(policy["autonomous_authority"]["founder_gate_required"])
        self.assertEqual(
            gates,
            {
                "ADD_OR_CREATE_CREDENTIAL",
                "REPLACE_CREDENTIAL",
                "ROTATE_CREDENTIAL",
                "REVOKE_CREDENTIAL",
                "EXPAND_CREDENTIAL_OR_ACCOUNT_IDENTITY_SCOPE",
            },
        )

    def test_runtime_policy_allows_governed_external_actions(self):
        spec = importlib.util.spec_from_file_location("policy", ROOT / "orchestrator" / "policy.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        state = {
            "victor": {"ai_ready": True},
            "security": {"department_credentials_isolated": True, "secret_values_exposed": False},
        }
        result = module.evaluate(
            {"capabilities": ["spend_money", "publish_external", "use_department_secret"]}, state
        )
        self.assertTrue(result["allowed"])
        blocked = module.evaluate({"capabilities": ["rotate_credential"]}, state)
        self.assertFalse(blocked["allowed"])
        self.assertEqual(blocked["blocked_capabilities"], ["rotate_credential"])

    def test_department_contracts_match_registry(self):
        registry = {item["id"]: item for item in load("data/department_registry.json")["departments"]}
        aura = load("departments/aura3.json")
        rio = load("departments/rio.json")
        self.assertEqual(aura["transport"]["status"], registry["aura3"]["victor_connection"])
        self.assertEqual(aura["live_certification"], registry["aura3"]["live_certification"])
        self.assertEqual(rio["victor_connection"], registry["rio"]["victor_connection"])
        self.assertEqual(rio["live_certification"], registry["rio"]["live_certification"])

    def test_credential_policy_has_no_shared_pool(self):
        policy = load("data/credential_vault_policy.json")
        management = load("data/management_protocol.json")
        self.assertEqual(policy["model"], "DEPARTMENT_SCOPED_ONLY_NO_SHARED_POOL")
        self.assertEqual(
            management["security"]["credential_broker_model"],
            "DEPARTMENT_SCOPED_ONLY_NO_SHARED_POOL",
        )


if __name__ == "__main__":
    unittest.main()
