"""Export manuel et figé du contrat de données de l'univers Job Agent.

Lit UNE FOIS les deux traces réelles déjà produites par le scoring RAG de
Job Agent — jamais rejouées, jamais reproduites ailleurs — et écrit
public/univers/job-agent/job-agent-trace-24.json. Ce script n'est jamais
appelé au build ni au runtime (D-17) : le JSON généré devient la seule
source que l'univers lit.

Sources (hors dépôt Portfolio, jamais lues par l'application) :
  multi-agent-project/job-agent/scoring/traces_test/trace_24.json
  multi-agent-project/job-agent/scoring/traces_test/trace_24_atomic.json

Aucune offre n'est rejouée : offer_id 24 correspond aux deux traces déjà
identifiées et validées. Aucun score global, aucune distance, aucun texte
d'exigence n'est inventé — tout provient des champs `query`, `conclusion`
et `results[].distance` déjà présents dans les traces.
"""

import json
import re
from pathlib import Path

TRACE_DIR = Path(
    r"C:\Users\Rayan\Documents\Claude-code\multi-agent-project\job-agent\scoring\traces_test"
)
COMPOSITE_PATH = TRACE_DIR / "trace_24.json"
ATOMIC_PATH = TRACE_DIR / "trace_24_atomic.json"

# Texte verbatim-identique entre les deux traces (§ vérifié à l'inspection) :
# seule cette exigence est détaillée atome par atome dans l'univers.
QMS_TEXT = "gouvernance et gestion des données QMS (ISO 13485, FDA 21 CFR Part 820, EU MDR)"

OUT_PATH = (
    Path(__file__).resolve().parent.parent
    / "public"
    / "univers"
    / "job-agent"
    / "job-agent-trace-24.json"
)


def best_distance(query: dict) -> float | None:
    m = re.search(r"best_distance=([\d.]+)", query["conclusion"])
    if m:
        return float(m.group(1))
    # "aucun match fiable -> flag_uncertain" ne répète pas la distance dans la
    # conclusion : elle reste le meilleur (plus petit) des résultats essayés.
    results = query.get("results", [])
    return min((r["distance"] for r in results), default=None)


def verdict(conclusion: str) -> str:
    return "flag_uncertain" if "flag_uncertain" in conclusion else "retenu"


def main():
    with open(COMPOSITE_PATH, "r", encoding="utf-8") as f:
        composite_trace = json.load(f)
    with open(ATOMIC_PATH, "r", encoding="utf-8") as f:
        atomic_trace = json.load(f)

    assert composite_trace["offer_id"] == atomic_trace["offer_id"] == 24

    composite_reqs = [
        q for q in composite_trace["rag_queries"] if q["step"] == "requirement"
    ]
    atoms = [
        q for q in atomic_trace["rag_queries"] if q["step"] == "requirement_atom"
    ]

    composite_items = [
        {
            "texte": q["query"],
            "distance": best_distance(q),
            "verdict": verdict(q["conclusion"]),
        }
        for q in composite_reqs
    ]

    # Regroupe les 63 atomes par exigence composite d'origine (préfixe [..]).
    groups: dict[str, list[dict]] = {}
    for a in atoms:
        m = re.match(r"^\[(.*?)\] (.*)$", a["query"])
        composite_text, atom_label = m.group(1), m.group(2)
        groups.setdefault(composite_text, []).append(
            {
                "label": atom_label,
                "distance": best_distance(a),
                "verdict": verdict(a["conclusion"]),
            }
        )

    qms_atoms = groups.pop(QMS_TEXT)

    resume_autres = [
        {
            "texte": texte,
            "distance": min(a["distance"] for a in items if a["distance"] is not None),
            "verdict": "flag_uncertain" if any(a["verdict"] == "flag_uncertain" for a in items) else "retenu",
            "atomes": len(items),
        }
        for texte, items in groups.items()
    ]

    total_atoms = len(atoms)
    total_retenus = sum(1 for a in atoms if verdict(a["conclusion"]) == "retenu")
    total_signaux = total_atoms - total_retenus

    snapshot = {
        "meta": {
            "snapshot": "job-agent-trace-24",
            "offer_id": 24,
            "source_composite": "trace_24.json",
            "source_atomic": "trace_24_atomic.json",
            "note": "Traces réelles du pipeline de scoring RAG, non rejouées. Aucun score global : ces distances mesurent la proximité sémantique d'une exigence à un chunk du profil, pas un score de matching global.",
        },
        "composite": {
            "requirements": len(composite_items),
            "retenues": sum(1 for i in composite_items if i["verdict"] == "retenu"),
            "signaux": sum(1 for i in composite_items if i["verdict"] == "flag_uncertain"),
            "items": composite_items,
        },
        "atomique": {
            "atomes": total_atoms,
            "retenus": total_retenus,
            "signaux": total_signaux,
            "qms": {
                "texte": QMS_TEXT,
                "atomes": qms_atoms,
            },
            "resume_autres": resume_autres,
        },
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(snapshot, f, ensure_ascii=False, indent=2)

    print(f"Écrit : {OUT_PATH}")
    print(f"Composite : {len(composite_items)} exigences")
    print(f"Atomique : {total_atoms} atomes, {total_retenus} retenus, {total_signaux} signal(aux)")
    print(f"QMS : {len(qms_atoms)} atomes")


if __name__ == "__main__":
    main()
