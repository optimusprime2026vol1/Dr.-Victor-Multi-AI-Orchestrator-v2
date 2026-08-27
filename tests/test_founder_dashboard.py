import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")


class FounderDashboardContractTests(unittest.TestCase):
    def test_founder_surfaces_exist(self):
        for marker in (
            "Founder Control Room",
            "Victor Orchestration Map",
            "Live Activity & Communication",
            "Who Is Doing What",
            "Founder Approval Queue",
            "Approved Revenue",
            "Paid Settlement",
        ):
            self.assertIn(marker, HTML)

    def test_truth_and_evidence_guards_exist(self):
        for marker in (
            "UNKNOWN / NOT VERIFIED",
            "Revenue appears only from approved commission evidence",
            "Evidence unavailable",
            "data/system_state.json",
            "data/department_registry.json",
            "data/rio_work_status.json",
        ):
            self.assertIn(marker, HTML)

    def test_current_department_names_and_refresh_exist(self):
        for marker in ("AURA 3.0", "Tony Stark", "RIO", "setInterval(load,60000)"):
            self.assertIn(marker, HTML)
        self.assertNotIn("AURA2 linked to real Gemini", HTML)

    def test_communication_animation_is_evidence_driven(self):
        for marker in (
            "animateMotion",
            'id="comm-route"',
            "startCommunicationReplay",
            "No new persisted department message",
        ):
            self.assertIn(marker, HTML)

    def test_compact_expandable_action_format_exists(self):
        for marker in ("line-clamp:2", "Click to expand", "classList.toggle('expanded')"):
            self.assertIn(marker, HTML)

    def test_mobile_and_accessibility_basics_exist(self):
        self.assertIn("@media(max-width:720px)", HTML)
        self.assertIn('aria-label="Business metrics"', HTML)
        self.assertIn('aria-label="Search activity"', HTML)


if __name__ == "__main__":
    unittest.main()
