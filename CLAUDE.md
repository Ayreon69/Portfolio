# CLAUDE.md — Portfolio Rayan Jemai

## Ce que ce projet est

Un portfolio personnel construit comme un système, pas comme une vitrine. La
référence complète (positionnement, philosophie, direction artistique, UX,
architecture, contenu des projets, roadmap) vit dans
[`PORTFOLIO-SOURCE-DE-VERITE-v4.md`](PORTFOLIO-SOURCE-DE-VERITE-v4.md) — **toujours
la lire avant de trancher quoi que ce soit sur ce projet.** Ce fichier-ci ne fait
que rappeler ce qu'une session Claude Code ne doit jamais réinventer ou
contredire par erreur.

## Le principe directeur (à ne jamais oublier)

> **Le site ne dit pas « regardez comme je sais faire du Web ».**
> **Il dit « regardez ce que je suis capable de construire avec la technologie ».**

Devant un choix entre un effet impressionnant et une démonstration lisible de ce
qui a été construit, **la démonstration gagne. Toujours.**

## Test de cohérence (§00.3 de la source de vérité — copié tel quel)

Une décision de design ou de développement est cohérente si la réponse est
**oui** aux cinq questions :

1. Est-ce que cela rend le profil ou un projet plus compréhensible, plus
   explorable ou plus mémorable ?
2. Est-ce que cela maintient une navigation immédiate pour un recruteur pressé ?
3. Est-ce que cela sert la philosophie
   `FRICTION → COMPRENDRE → CONSTRUIRE → AUTOMATISER → ITÉRER` ?
4. Est-ce que cela conserve l'équilibre 60 % lisibilité / 40 % expérimentation ?
5. Est-ce que le résultat ressemble à un laboratoire data personnel et premium
   — plutôt qu'à une démo d'effets web ?

Applique ce test avant toute décision de design ou de développement non
triviale. Si la réponse est non à une seule question, ne procède pas sans le
signaler.

## Le projet est en phase de resserrement, pas d'enrichissement (depuis 2026-09-05)

Le concept, le contenu, le design system et les données sont maintenant
cohérents entre eux (positionnement → philosophie → Data DNA → projets →
preuves → architecture). **Ne plus proposer d'ajouts au blueprint.** La question
à se poser sur toute nouvelle idée n'est plus *« qu'est-ce qu'on peut ajouter ? »*
mais *« qu'est-ce qu'on peut enlever sans perdre l'idée ? »* — une animation qui
n'apporte aucune compréhension, un nœud sans relation significative, une phrase
qui en répète une autre, une techno juste là pour faire joli, une interaction
qui ralentit le recruteur : ça se supprime, ça ne se justifie pas. Les effets
sont déjà gelés (§03.2). La qualité d'exécution compte maintenant plus que la
richesse des idées.

## Règles non négociables

- **Aucune arête du Data DNA n'est inventée**, et **une arête doit aussi être
  narrativement significative** (règle actée le 2026-09-05, §04.7) : toute
  relation entre un projet (ou une expérience professionnelle) et une
  compétence/cluster doit être dérivée d'une grille `§04.4` réelle *et*
  expliquer comment Rayan construit — pas simplement lister une dépendance
  technique incidentelle (celle-ci reste en texte dans la page projet, pas dans
  le graphe). L'auto-évaluation de compétences ne fixe que la *taille* des
  nœuds, jamais une arête.
- **Le canvas 3D vit dans `app/layout.tsx` racine, jamais démonté entre routes.**
  Voir `§07.1` et `prototype-persistance-canvas/` pour le pattern validé.
- **Aucune donnée personnelle ou confidentielle ne doit fuiter dans un dépôt
  public.** Avant de rendre un projet public, vérifier : CV, profils candidats,
  informations sur des tiers (famille, conjoint·e), noms internes d'entreprise
  non anonymisés, jeux de données réels non anonymisés. En cas de doute,
  vérifier le contenu réellement versionné (`git ls-files`) avant de changer la
  visibilité d'un dépôt.
- **Français en langue de référence.** Vocabulaire technique en anglais sans
  traduction (`Python`, `SQL`, `LLM`, `Agents`...), tout le reste en français,
  avec les diacritiques et guillemets français corrects.
- **`prefers-reduced-motion` respecté partout, sans exception.**
- **Le site reste utilisable sans WebGL et sans JavaScript** (contenu lisible
  par un crawler ou lecteur d'écran).

## Où sont les choses

| Quoi | Où |
|---|---|
| Blueprint complet, roadmap, décisions ouvertes | `PORTFOLIO-SOURCE-DE-VERITE-v4.md` |
| Design system opérationnel (couleurs, typo, motion, perf) | `design-system.md` |
| Data DNA — nœuds et arêtes du graphe | `data/nodes.json`, `data/edges.json` |
| Prototypes validés — canvas persistant, Hero, Data DNA visuel | `prototype-persistance-canvas/` (routes `/`, `/data-dna`) |
| Plan d'intégration du Data DNA dans la homepage | `PLAN-INTEGRATION-DATA-DNA.md` |

## Avant de commencer les wireframes ou le développement

Relire `PORTFOLIO-SOURCE-DE-VERITE-v4.md` §13 (roadmap) pour l'état à jour du
chemin critique et des décisions encore ouvertes. Ne pas supposer qu'une
décision listée comme "OUVERT" ailleurs dans le document est tranchée sans
vérifier le registre des décisions (§B) et des arbitrages (§A) en fin de
document — ils font foi sur ce qui est réellement figé.
