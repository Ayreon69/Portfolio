"""Export manuel et figé de l'instantané AI Watch.

Lit UNE FOIS le vault Obsidian (sources.yaml + archive quotidienne) et écrit
public/univers/ai-watch/ai-watch-2026-08-22.json. Ce script n'est jamais
appelé au build ni au runtime : le JSON généré devient la seule source que
l'application lit. Toute mise à jour du récit exige un nouvel export manuel,
daté, et une vérification chiffre par chiffre avant remplacement (D-17).

Fenêtre reproduite : 2026-08-04 -> 2026-08-22 (19 jours d'archive).
Seuil "utile" : score >= 0.50 (veille/config.py -> SEUIL_UTILE).
Les items de categorie "signets" (comptes X, pipeline distinct) sont exclus :
ce ne sont pas des sources de sources.yaml.
"""

import json
from pathlib import Path

import yaml

VAULT = Path(r"C:\Users\Rayan\Documents\Obsidian Vault\IA\.veille")
SOURCES_YAML = VAULT / "sources.yaml"
DATA_DIR = VAULT / "data"

WINDOW_START = "2026-08-04"
WINDOW_END = "2026-08-22"
WINDOW_DAYS = [
    "2026-08-04", "2026-08-05", "2026-08-06", "2026-08-07", "2026-08-08",
    "2026-08-09", "2026-08-10", "2026-08-11", "2026-08-12", "2026-08-13",
    "2026-08-14", "2026-08-15", "2026-08-16", "2026-08-17", "2026-08-18",
    "2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22",
]
SEUIL_UTILE = 0.50
# Les 7 sources désactivées le 22/08/2026 sur la base du rendement mesuré dans
# cette fenêtre -- distinct des sources jamais activées (linuxfr, numerama,
# usine_digitale) et de the_batch (coupée sur un blocage Cloudflare, pas sur son rendement).
SOURCES_COUPEES_RENDEMENT = {
    "google_ai", "google_research", "reddit_ml", "bens_bites",
    "thezvi", "next_ink", "octo",
}
OUT_PATH = Path(__file__).resolve().parent.parent / "public" / "univers" / "ai-watch" / "ai-watch-2026-08-22.json"


def charger_sources():
    with open(SOURCES_YAML, "r", encoding="utf-8") as f:
        raw = yaml.safe_load(f)
    return raw


def charger_items_fenetre():
    items = []
    for jour in WINDOW_DAYS:
        path = DATA_DIR / f"{jour}.json"
        with open(path, "r", encoding="utf-8") as f:
            jour = json.load(f)
        items.extend(jour["items"])
    return items


def main():
    sources = charger_sources()
    items = charger_items_fenetre()

    # Exclut explicitement les signets (comptes X) : pipeline distinct de sources.yaml.
    items_sources = [it for it in items if it.get("categorie") != "signets"]

    par_source = {}
    for it in items_sources:
        sid = it.get("source_id")
        par_source.setdefault(sid, []).append(it)

    lignes = []
    total_items = 0
    total_utiles = 0
    coupees_items = 0
    coupees_utiles = 0

    for s in sources:
        sid = s["id"]
        items_s = par_source.get(sid, [])
        n = len(items_s)
        scores = [it["score"] for it in items_s if it.get("score") is not None]
        utiles = sum(1 for sc in scores if sc >= SEUIL_UTILE)
        score_moyen = round(sum(scores) / len(scores), 3) if scores else None
        rendement = round(utiles / n, 3) if n > 0 else None

        raison = None
        if not s.get("actif", True):
            # La raison documentée vit en commentaire YAML, non capturée par le
            # parseur : elle est reportée ici à la main depuis sources.yaml, pas
            # inventée -- copie exacte du texte présent au-dessus de chaque source.
            raison = RAISONS_DESACTIVATION.get(sid)

        ligne = {
            "id": sid,
            "nom": s["nom"],
            "categorie": s.get("categorie"),
            "poids": s.get("poids"),
            "actif": bool(s.get("actif", True)),
            "items": n,
            "utiles": utiles,
            "rendement": rendement,
            "score_moyen": score_moyen,
            "raison_desactivation": raison,
        }
        lignes.append(ligne)

        total_items += n
        total_utiles += utiles
        if sid in SOURCES_COUPEES_RENDEMENT:
            coupees_items += n
            coupees_utiles += utiles

    snapshot = {
        "meta": {
            "snapshot": "ai-watch-2026-08-22",
            "fenetre_debut": WINDOW_START,
            "fenetre_fin": WINDOW_END,
            "fenetre_jours": len(WINDOW_DAYS),
            "seuil_utile": SEUIL_UTILE,
            "exclusions": "Les items de categorie 'signets' (comptes X, pipeline collecte_signets.js) sont exclus : ce ne sont pas des sources de sources.yaml.",
            "sources_declarees": len(sources),
            "sources_presentes": sum(1 for l in lignes if l["items"] > 0),
            "sources_sans_item": sum(1 for l in lignes if l["items"] == 0),
        },
        "totaux": {
            "items": total_items,
            "utiles": total_utiles,
        },
        "sous_ensemble_coupe": {
            "items": coupees_items,
            "utiles": coupees_utiles,
        },
        "sources": lignes,
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(snapshot, f, ensure_ascii=False, indent=2)

    print(f"Écrit : {OUT_PATH}")
    print(f"Sources déclarées : {len(sources)}")
    print(f"Total items (hors signets) : {total_items}, utiles : {total_utiles}")
    print(f"Sous-ensemble coupé : {coupees_items} items, {coupees_utiles} utiles")


# Reporté à la main depuis les commentaires de sources.yaml (7 coupées au rendement).
RAISONS_DESACTIVATION = {
    "google_ai": "Désactivée le 22/08/2026 — 6 items en 19 jours, 0 utile (0 %). Communication produit, sans contenu technique exploitable.",
    "google_research": "Désactivée le 22/08/2026 — 5 items en 19 jours, 0 utile (0 %). Recherche fondamentale, hors du champ agentic coding.",
    "reddit_ml": "Désactivée le 22/08/2026 — 114 items en 19 jours, 10 utiles (9 %). Flux brut, non trié par votes — contrairement à r/LocalLLaMA qui est sur /top.",
    "bens_bites": "Désactivée le 22/08/2026 — 9 items en 19 jours, 0 utile (0 %). Newsletter grand public, reprend ce que les labos publient déjà.",
    "the_batch": "Désactivé : Cloudflare renvoie 403 depuis les IP de datacenter (GitHub Actions). Fonctionne depuis une connexion résidentielle.",
    "thezvi": "Désactivée le 22/08/2026 — 10 items en 19 jours, 0 utile (0 %). Essais longs sur l'alignement et la gouvernance, hors profil.",
    "next_ink": "Désactivée le 22/08/2026 — 138 items en 19 jours, 9 utiles (7 %). Actualité tech française généraliste, très peu sur l'IA appliquée.",
    "octo": "Désactivée le 22/08/2026 — 5 items en 19 jours, 0 utile (0 %). Blog de conseil, sujets rarement liés à l'IA.",
    "linuxfr": "Jamais activée.",
    "numerama": "Jamais activée — vivante mais très bruyante sur l'IA, nécessiterait un filtre mots-clés strict.",
    "usine_digitale": "Jamais activée.",
}


if __name__ == "__main__":
    main()
