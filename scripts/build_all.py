"""Run every data builder in order. Each step is independent: if one source fails,
the site still publishes with the data it already has (and says so)."""
import subprocess, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STEPS = [["scripts/prices.py"], ["scripts/insiders.py"], ["scripts/gdelt_events.py", "--fetch", "14"], ["scripts/shocks.py"], ["scripts/world_impact.py"], ["scripts/calls.py"], ["scripts/storm_stats.py"]]
failed = []
for step in STEPS:
    print("==>", *step, flush=True)
    if subprocess.run([sys.executable, *step], cwd=ROOT).returncode != 0:
        failed.append(step[0])
print("failed:", failed or "none")
