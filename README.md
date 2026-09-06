# Portfolio — Rayan Jemai

**Data Scientist · AI Builder · Data**

Portfolio personnel construit comme un système plutôt qu'une vitrine : le site
ne dit pas « regardez comme je sais faire du web », il montre ce qui a été
construit avec la technologie. Le principe complet, la philosophie et
l'architecture détaillée vivent dans
[`PORTFOLIO-SOURCE-DE-VERITE-v4.md`](PORTFOLIO-SOURCE-DE-VERITE-v4.md).

## Contenu

Cinq expérimentations documentées dans `/laboratoire`, chacune avec sa
construction, ses données, son système, son résultat et son recul :

- **Job Agent** — recherche d'emploi automatisée, agents + RAG
- **ARAM Stats** — statistiques du mode ARAM (League of Legends), 1,5M lignes
- **Commission Bot** — assistant conversationnel sur règles métier (case study, dépôt privé)
- **AI Watch** — veille IA automatisée, ~34 sources arbitrées au rendement
- **Churn Prediction** — classification supervisée, reconstruction méthodologique

Quatre de ces cinq pages intègrent un **univers interactif** : une
démonstration du mécanisme réel du projet (pas une illustration), alimentée
par un instantané de données réel, figé et daté — jamais une valeur
inventée ni un score fabriqué.

Le reste du site : Hero avec canvas 3D persistant (graphe de compétences
« Data DNA », jamais démonté entre les routes), Philosophie, Profil,
Parcours, CV et Contact.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · React Three Fiber / three.js
pour le canvas persistant · TypeScript strict · CSS Modules.

Chaque univers interactif est alimenté par un fichier JSON versionné dans
`public/univers/`, produit une fois par un script d'export (`scripts/`)
jamais appelé au build — voir la décision **D-17** de la source de vérité.

## Développer

```bash
npm install
npm run dev
```

```bash
npm run typecheck   # tsc --noEmit
npm run check:data  # contrôles de non-régression sur le Data DNA et les univers
npm run build        # build de production
```

## Structure

| Dossier | Contenu |
|---|---|
| `app/` | Routes Next.js (App Router) |
| `components/` | Composants React, dont `univers/` (les 4 démonstrations interactives) |
| `content/` | Contenu éditorial des pages projet, séparé des données |
| `data/` | Data DNA — nœuds et arêtes du graphe (`nodes.json`, `edges.json`) |
| `lib/` | Logique pure : dérivation du graphe, moteurs des univers |
| `public/univers/` | Instantanés de données figés et datés, un par univers |
| `scripts/` | Scripts d'export (manuels) et contrôles de non-régression |
| `prototype-persistance-canvas/` | Prototype validé du pattern de canvas persistant |

## Licence

Code source personnel, publié à titre de démonstration. Le CV
(`public/CV_Rayan_Jemai_2026.pdf`) contient des coordonnées personnelles
publiées volontairement.
