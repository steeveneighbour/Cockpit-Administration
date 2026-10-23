# Cockpit — Pilotage administratif transversal

**Initiative logicielle indépendante, en développement.** Cockpit vise à réduire le travail administratif répétitif, à relier les informations dispersées et à préparer des décisions compréhensibles et vérifiables, au bénéfice des agents publics et de leurs collectifs.

> Enlever ce qui encombre. Relier ce qui est dispersé. Montrer ce qui contraint. Laisser l'humain arbitrer.

## Démonstrateur concret : CP-001

**[Explorer le parcours illustratif (HTML autonome)](exemples/cp001/parcours.html)** — [Données, tests et limites](exemples/cp001/README.md).

48 inscriptions fictives, une jauge de 24 places pour 32 demandes, puis trois options d'arbitrage. Ouvrir le HTML après téléchargement du dossier pour l'essayer hors connexion. **Il s'agit d'un démonstrateur indépendant, pas de l'application Cockpit ni d'une capture de son interface.** Le logiciel reste privé.
## Pour qui ?

Agents publics, secrétaires généraux, responsables de services, équipes de coordination, services supports et collectifs qui gèrent des échéances, dossiers, documents, projets, ressources et arbitrages. Le projet n'est rattaché à aucun ministère et n'a reçu aucune validation institutionnelle.

## Problème

Le travail est dispersé entre documents, répertoires locaux, courriels, tableaux, agendas et logiciels métiers. Cette fragmentation impose des ressaisies, rend les dépendances difficiles à percevoir et fragilise la continuité lorsque les personnes changent de poste ou sont indisponibles.

## Hypothèse Cockpit

**Importer → relier → comprendre → proposer → contrôler / arbitrer → suivre → rendre compte.**

- Un point d'entrée documentaire, sans GED imposée ni déplacement silencieux des sources.
- Une représentation cohérente des dossiers, projets, actions, échéances, ressources et finances de pilotage.
- Des propositions d'organisation et de recalage explicables, avec conséquences et incertitudes visibles.
- Des alertes réservées autant que possible aux situations exigeant une intervention.
- Des scénarios adaptés aux contextes de travail, sans créer des logiciels métiers réglementaires parallèles.

Le développement est progressif : **toutes ces fonctions ne sont pas considérées comme achevées, vérifiées ou disponibles en production**.

## Boussole sociale

Cockpit vise la **robustesse de l'activité** plutôt que l'optimisation maximale de l'occupation de chaque agent. Une simulation de planning ne vaut ni preuve de disponibilité humaine, ni mesure de performance individuelle. Les marges de manœuvre et la décision collective doivent rester visibles.

## Technique et limites actuelles

- Prototype de bureau Windows, C# / .NET 10 / WPF.
- Architecture modulaire Domain / Application / Infrastructure / Presentation.
- Usage local prioritaire, IA non obligatoire.
- Sources administratives et logiciels métiers officiels conservés comme références.
- Exports et propositions à vérifier avant toute utilisation officielle.
- Développement et consolidation en cours ; aucune homologation, conformité générale ou disponibilité en production revendiquée.

## Code source : situation au 23 octobre 2026

**Cette vitrine n'est pas le dépôt du code applicatif.** La version interne du projet est privée et contient encore des éléments destinés à des usages publics et privés. Une séparation des sources, des binaires et des historiques est en cours. Aucun code applicatif n'est promis comme libre tant que les droits, licences, dépendances et risques de divulgation ne sont pas vérifiés.

Voir [Statut de publication](STATUT_DE_PUBLICATION.md) et [Fiche projet](FICHE_PROJET.md).

## Échanges souhaités

Critiques techniques, retours d'agents sur les tâches réellement pénibles, identification des briques déjà libres, discussions sur la gouvernance d'une éventuelle ouverture du code et sur l'amélioration des conditions d'exercice des missions publiques.

**Canal de prise de contact** : [Forum du numérique ouvert](https://forum.ouvert.numerique.gouv.fr/) (authentification requise).

Cette présentation n'est ni un produit de l'État ni une offre d'installation et ne suppose aucun partenariat officiel.
