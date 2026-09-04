import json

def inspect():
    with open("data/demo_mplads.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Total Records: {len(data)}")
    samples = {}
    for r in data:
        arch = r["archetype"]
        if arch not in samples:
            samples[arch] = r

    for arch, r in samples.items():
        print(f"\n--- Archetype: {arch} ---")
        print(f"Project Code : {r.get('project_code')}")
        print(f"Title        : {r.get('title')}")
        print(f"Location     : {r.get('village_or_ward')}, {r.get('district')}, {r.get('state')}")
        print(f"Sector       : {r.get('sector')} ({r.get('output_unit')})")
        print(f"Finance      : Sanctioned=INR {r.get('sanctioned_amount', 0):,.0f} | Released=INR {r.get('released_amount', 0):,.0f} | Spent=INR {r.get('expenditure_amount', 0):,.0f}")
        print(f"Progress     : Physical={r.get('physical_progress_pct')}% | Financial={r.get('financial_progress_pct')}%")
        print(f"Timeline     : Sanction={r.get('sanction_date')} | Expected={r.get('expected_completion_date')}")
        print(f"Attribution  : {r.get('data_attribution')}")

if __name__ == "__main__":
    inspect()
