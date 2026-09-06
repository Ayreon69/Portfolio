# -*- coding: utf-8 -*-
"""
Export de l'INSTANTANÉ ARAM — patch 16.17.

Règle actée le 2026-09-06 (§B, décision D-15) : un univers interactif est
alimenté par un instantané FIGÉ ET DATÉ, cohérent avec le texte publié à la
date de l'export. Jamais de réexport live implicite. Ce script n'est donc pas
lancé au build : il est lancé à la main, une fois, et son résultat est versionné.

Source : API LoL / data/mayhem.db, ouverte en LECTURE SEULE.
Sortie  : public/univers/aram/  (3 fichiers, ~146 Ko gzip au total)

Ce qui est exporté : les tables d'AGRÉGATS, déjà calculées par le pipeline
Python (`build_aggregates.py`). Les tables de détail (items 15,8 M lignes,
picks 9,3 M, participants 2,2 M) ne sont JAMAIS servies au navigateur : les
agréger côté client referait un travail déjà payé côté Python, pour 2 Go de
transfert.

Format du .bin.gz — colonne-majeur, identifiants remplacés par un index de
dictionnaire, exactement le format du site public du projet :

    [u32 headerLen][headerLen octets de JSON UTF-8][colonnes brutes]

Le JSON d'en-tête décrit chaque table, ses colonnes, leur type et leur offset.
Les offsets sont alignés sur 4 octets pour que les vues u32 soient valides.
Le fichier est gzippé : le navigateur le décompresse avec DecompressionStream,
comme le fait le site du projet.
"""
import gzip
import json
import io
import os
import struct
import sqlite3
from datetime import date

PATCH = "16.17"
DB = r"C:/Users/Rayan/Documents/Claude-code/API LoL/data/mayhem.db"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "univers", "aram")
CHAMPIONS_JSON = r"C:/Users/Rayan/Documents/Claude-code/API LoL/data/champions.json"

conn = sqlite3.connect("file:%s?mode=ro" % DB, uri=True)


def dictionary(table, key):
    """Index de dictionnaire : les ids réels (parfois > 65535) deviennent des
    indices u16 contigus. C'est ce qui permet de tenir en u16."""
    ids = sorted(r[0] for r in conn.execute(
        "SELECT DISTINCT %s FROM %s WHERE patch=?" % (key, table), (PATCH,)))
    return {v: i for i, v in enumerate(ids)}, ids


def u16(v):
    return struct.pack("<%dH" % len(v), *v)


def u32(v):
    return struct.pack("<%dI" % len(v), *v)


def main():
    os.makedirs(OUT, exist_ok=True)

    d_ch, ids_ch = dictionary("agg_champion", "champion_id")
    d_au, ids_au = dictionary("agg_augment", "augment_id")
    d_it, ids_it = dictionary("agg_item", "item_id")

    tables = {}

    # Tables simples : un identifiant, n parties, n victoires.
    for name, tbl, key, dic in [
        ("champion", "agg_champion", "champion_id", d_ch),
        ("augment", "agg_augment", "augment_id", d_au),
        ("item", "agg_item", "item_id", d_it),
    ]:
        rows = list(conn.execute(
            "SELECT %s,n,wins FROM %s WHERE patch=? ORDER BY %s" % (key, tbl, key), (PATCH,)))
        tables[name] = {
            "rows": len(rows),
            "columns": [
                ("id", "u16", u16([dic[r[0]] for r in rows])),
                ("n", "u32", u32([r[1] for r in rows])),
                ("wins", "u32", u32([r[2] for r in rows])),
            ],
        }

    # Tables de paires : c'est sur elles que porte le filtrage réel.
    # AUCUN seuil n'est appliqué. Un seuil `n >= 10` économiserait 22 Ko gzip
    # mais supprimerait exactement les combinaisons rares — celles dont
    # l'intervalle de confiance dépasse le palier de tier. Or c'est ce que
    # l'univers doit montrer : le moment où la donnée cesse d'être décidable.
    for name, tbl, ka, kb, da, db in [
        ("champ_augment", "agg_champ_augment", "champion_id", "augment_id", d_ch, d_au),
        ("champ_item", "agg_champ_item", "champion_id", "item_id", d_ch, d_it),
    ]:
        rows = list(conn.execute(
            "SELECT %s,%s,n,wins FROM %s WHERE patch=? ORDER BY %s,%s"
            % (ka, kb, tbl, ka, kb), (PATCH,)))
        tables[name] = {
            "rows": len(rows),
            "columns": [
                ("a", "u16", u16([da[r[0]] for r in rows])),
                ("b", "u16", u16([db[r[1]] for r in rows])),
                ("n", "u32", u32([r[2] for r in rows])),
                ("wins", "u32", u32([r[3] for r in rows])),
            ],
        }

    # Assemblage : en-tête JSON auto-descriptif, puis les colonnes, alignées.
    header = {"patch": PATCH, "tables": {}}
    body = bytearray()
    for name, t in tables.items():
        cols = []
        for col_name, kind, blob in t["columns"]:
            while len(body) % 4:
                body.append(0)
            cols.append({"name": col_name, "type": kind,
                         "offset": len(body), "bytes": len(blob)})
            body += blob
        header["tables"][name] = {"rows": t["rows"], "columns": cols}

    head = json.dumps(header, separators=(",", ":")).encode("utf-8")
    blob = struct.pack("<I", len(head)) + head + bytes(body)
    gz = gzip.compress(blob, 9)
    with open(os.path.join(OUT, "aram-%s.bin.gz" % PATCH), "wb") as f:
        f.write(gz)

    # Libellés : lus une fois, servis en JSON. Indexés comme les colonnes.
    champions = json.load(io.open(CHAMPIONS_JSON, encoding="utf-8"))
    aug_names = {r[0]: r[1] for r in conn.execute("SELECT augment_id,name FROM augments")}
    item_names = {r[0]: r[1] for r in conn.execute("SELECT item_id,name FROM item_names")}
    patch_row = conn.execute(
        "SELECT games,players FROM agg_patch WHERE patch=?", (PATCH,)).fetchone()

    labels = {
        "patch": PATCH,
        "exportedAt": date.today().isoformat(),
        "games": patch_row[0],
        "players": patch_row[1],
        "champion": [str(champions.get(str(i), champions.get(i, i))) for i in ids_ch],
        "augment": [aug_names.get(i) or ("Augment %d" % i) for i in ids_au],
        "item": [item_names.get(i) or ("Objet %d" % i) for i in ids_it],
    }
    with open(os.path.join(OUT, "aram-%s.labels.json" % PATCH), "w", encoding="utf-8") as f:
        json.dump(labels, f, ensure_ascii=False, separators=(",", ":"))

    # Repli sans JS : le classement que le serveur rend en HTML. Calculé ICI,
    # une fois, pour que la page reste lisible sans JavaScript et sur mobile
    # sans jamais télécharger les 146 Ko de colonnes.
    def top(table, key_dic, names, limit=12, min_n=200):
        rows = list(conn.execute(
            "SELECT %s,n,wins FROM %s WHERE patch=? AND n>=? ORDER BY CAST(wins AS REAL)/n DESC LIMIT ?"
            % (key_dic, table, ), (PATCH, min_n, limit)))
        return [{"label": names.get(r[0]) or str(r[0]), "n": r[1],
                 "winrate": round(100.0 * r[2] / r[1], 2)} for r in rows]

    champ_names = {}
    for i in ids_ch:
        champ_names[i] = str(champions.get(str(i), champions.get(i, i)))

    fallback = {
        "patch": PATCH,
        "exportedAt": labels["exportedAt"],
        "games": patch_row[0],
        "augment": top("agg_augment", "augment_id", aug_names),
        "item": top("agg_item", "item_id", item_names),
        "champion": top("agg_champion", "champion_id", champ_names),
    }
    with open(os.path.join(OUT, "aram-%s.fallback.json" % PATCH), "w", encoding="utf-8") as f:
        json.dump(fallback, f, ensure_ascii=False, indent=1)

    print("patch %s — %d parties, %d lignes joueur" % (PATCH, patch_row[0], patch_row[1]))
    for name, t in header["tables"].items():
        print("  %-16s %6d lignes" % (name, t["rows"]))
    print("  colonnes : brut %.1f Ko  gzip %.1f Ko" % (len(blob) / 1024, len(gz) / 1024))
    print("  libellés : %.1f Ko" % (os.path.getsize(os.path.join(OUT, "aram-%s.labels.json" % PATCH)) / 1024))
    print("  repli    : %.1f Ko" % (os.path.getsize(os.path.join(OUT, "aram-%s.fallback.json" % PATCH)) / 1024))


if __name__ == "__main__":
    main()
