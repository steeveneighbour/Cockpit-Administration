#!/usr/bin/env python3
"""Reproducteur autonome CP-001 : inscriptions et capacités fictives.

Ce script n'est pas le logiciel Cockpit, ni son code applicatif.
"""
import argparse
import csv
import json
from collections import Counter
from pathlib import Path


def lire_csv(chemin, colonnes):
    with open(chemin, encoding="utf-8-sig", newline="") as fichier:
        reader = csv.DictReader(fichier)
        if reader.fieldnames != colonnes:
            raise ValueError(f"Colonnes inattendues dans {chemin}")
        rows = list(reader)
    if any(None in row or any(not val or not val.strip() for val in row.values()) for row in rows):
        raise ValueError(f"Ligne CSV incomplète dans {chemin}")
    return rows


def analyser(dossier):
    dossier = Path(dossier)
    inscriptions = lire_csv(dossier / "inscriptions-demo.csv",
                           ["participant_id", "creneau", "atelier", "statut", "source"])
    capacites = lire_csv(dossier / "capacites-ateliers-demo.csv",
                       ["creneau", "atelier", "capacite"])
    ids = [row["participant_id"] for row in inscriptions]
    if len(set(ids)) != len(ids):
        raise ValueError("Doublon d'identifiant d'inscription")
    if any(row["statut"] != "confirme" for row in inscriptions):
        raise ValueError("Cette illustration ne traite que des confirmations")
    compte = Counter((row["creneau"], row["atelier"]) for row in inscriptions)
    deja = set()
    synthese = []
    for row in capacites:
        cle = (row["creneau"], row["atelier"])
        if cle in deja:
            raise ValueError("Capacité déclarée plusieurs fois")
        deja.add(cle)
        try:
            jauge = int(row["capacite"])
        except ValueError as exc:
            raise ValueError("Capacité non entière") from exc
        if jauge <= 0:
            raise ValueError("Capacité non positive")
        demandes = compte[cle]
        synthese.append({
            "creneau": cle[0], "atelier": cle[1], "demandes": demandes,
            "capacite": jauge, "depassement": max(0, demandes-jauge),
            "places_theoriques": max(0, jauge-demandes)
        })
    if set(compte) - deja:
        raise ValueError("Inscriptions sans capacité correspondante")
    return {"inscriptions": len(inscriptions), "creneaux": synthese,
            "excedent_total": sum(x["depassement"] for x in synthese)}


def main():
    parser = argparse.ArgumentParser(description="Analyse fictive CP-001, sans dépendance externe.")
    parser.add_argument("--dossier", type=Path, default=Path(__file__).resolve().parent)
    args = parser.parse_args()
    print(json.dumps(analyser(args.dossier), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
