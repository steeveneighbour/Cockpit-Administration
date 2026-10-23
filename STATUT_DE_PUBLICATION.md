# Statut de publication — Cockpit Administration

**Date de référence : 23 octobre 2026**  
**Nature de ce dossier : documentation de présentation uniquement.**

| Élément | État |
| --- | --- |
| Description publique du projet | Préparée pour relecture et partage |
| Dépôt du code applicatif | Privé, non publié |
| Édition Administration séparée techniquement | Non prouvée |
| Historique Git purifié | Non produit |
| Licence du code Cockpit | Non déterminée |
| Revue de titularité des droits | À réaliser |
| Audit des dépendances, secrets et données | À réaliser pour l'export |
| Compilation/test d'un build Administration autonome | Non réalisé |
| Homologation ou référencement d'État | Aucun |

## Bloqueurs techniques connus

Le dépôt de travail contient un hôte de présentation et des bibliothèques mixtes, ainsi que des catalogues mêlant des capacités de plusieurs secteurs. Des travaux de découplage sont engagés dans l'issue interne #251 et des PR de diagnostic ou d'extraction, mais aucune certification d'édition exclusivement publique n'en découle.

La diffusion d'un paquet ou d'un historique Git issu du dépôt privé est donc **interdite tant qu'un export contrôlé distinct n'a pas été vérifié**. Ne pas transformer une copie de branche, un ZIP du dépôt ou un changement de visibilité GitHub en publication « Public ».

## Livrable effectivement partageable

Les cinq documents du dossier vitrine seulement (README, FICHE_PROJET, STATUT_DE_PUBLICATION, CONTRIBUTING, SECURITY) dans un dépôt public neuf, si la présentation elle-même est validée. Ils ne contiennent pas de code applicatif ni de données métier réelles.

## Conditions d'ouverture du code

1. Clarifier et documenter les droits de publication et choisir une licence compatible.
2. Approuver une liste blanche exhaustive de fichiers administratifs et réellement communs.
3. Vérifier la fermeture transitive des projets, dépendances, ressources, scripts et tests.
4. Exclure les secteurs privés du code source exporté **et** de son historique Git.
5. Auditer secrets, données personnelles, droits tiers, vulnérabilités et notices.
6. Produire un nouveau dépôt, au premier commit indépendant, et un build Administration reproductible.
7. Obtenir une recette Windows locale/hors connexion, incluant les tests négatifs de contamination par le secteur privé.

Ce document sert à éviter toute confusion entre présentation publique et publication d'un logiciel libre certifié.
