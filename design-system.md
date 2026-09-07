# DESIGN SYSTEM — Portfolio Rayan Jemai

Référence pratique dérivée de `PORTFOLIO-SOURCE-DE-VERITE-v4.md`. Ce fichier ne
réexplique pas le *pourquoi* (voir la source de vérité) — il donne les valeurs et
règles directement utilisables en code.

---

## Couleurs

```css
--cream:        #F4EFE4;  /* fond éditorial (HERO, PHILOSOPHIE, PROFIL, PARCOURS, CV) */
--black-deep:   #0D0D0F;  /* immersion (LABORATOIRE, pages projet, CONTACT) */
--warm-neutral: #8A7F6A;  /* bordures, texte discret sur crème */

--accent-job-agent:         #E0704A; /* ambre chaud */
--accent-aram-stats:        #3E8E7E; /* teal sourd */
--accent-commission-bot:    #B08D3E; /* or mat */
--accent-ai-watch:          #4A6FA5; /* bleu ardoise */
```

**Règle stricte :** un accent projet n'apparaît **que** sur la page de ce projet
(`/laboratoire/<slug>`). Jamais dans la navigation globale, le hero, ou une autre
page. Le site ne doit jamais lire comme un portfolio multicolore.

Contraste WCAG texte/accent **non encore vérifié** — à faire avant intégration
finale (chaque accent est plutôt sombre/mat, donc pensé pour du texte clair
par-dessus, mais à confirmer avec un vrai outil de contraste).

---

## Typographie

| Rôle | Famille | Google Fonts |
|---|---|---|
| Display (`RAYAN JEMAI`, grands titres) | **Bodoni Moda** | `family=Bodoni+Moda:opsz,wght@6..96,400..900` |
| Technique (labels, `EXP. 003`, métriques, `2026.09`) | **IBM Plex Mono** | `family=IBM+Plex+Mono:wght@400;500;600` |
| Texte courant (optionnel) | **IBM Plex Sans** | `family=IBM+Plex+Sans:wght@400;500;600` |

Toutes trois couvrent nativement le sous-ensemble Google Fonts `latin`
(`U+0000-00FF` + `U+0152-0153`) : accents français (é è ê à ç ù û î ô), `œ`/`Œ`,
guillemets `« »`. Aucun sous-ensemble étendu à charger.

**Règles de composition :**
- Contraste très/très marqué entre l'échelle display et l'échelle mono — ne jamais
  les rapprocher en taille.
- Espace insécable avant `? ! : ;` (typographie française).
- Labels de structure toujours en `IBM Plex Mono`, majuscules : `FRICTION`,
  `SYSTÈME`, `RÉSULTAT`, `EXPLORER`, `INSPECTER`, `OUVRIR`, `INTERAGIR`.

---

## Grille & espacement

> À figer précisément en phase wireframes (§12 du blueprint). Principes déjà
> actés : grandes marges, espace négatif généreux, grille éditoriale, lignes
> fines, petites annotations, numérotation des expérimentations, quelques
> éléments qui débordent légèrement de la grille. Échelle typographique,
> échelle d'espacement et grille **ne varient jamais** d'une expérimentation à
> l'autre (§03.6) — seule la densité/rythme de mise en page peut varier.

---

## Motion

| Contexte | Comportement |
|---|---|
| Interface (menu, boutons, textes, navigation) | Net, précis, prévisible |
| Système (particules, réseau, data, 3D) | Organique, inertie, vivant |
| Aucun mouvement | Système très calme |
| Souris | Réaction subtile |
| Hover | Réaction locale |
| Scroll | Transformation progressive |
| Clic | Transition plus dynamique |
| Navigation | Transformation du système (changement d'état, jamais recréation — voir §07.1) |

**Règles techniques :** n'animer que `transform`/`opacity` · respecter
`prefers-reduced-motion` partout · une animation signature par section · lazy-load
de toute lib > 40 Ko.

**Curseur contextuel** (desktop, pointeur fin uniquement) :

| Contexte | Curseur |
|---|---|
| Repos / Hero | `●` |
| Survol d'un projet | `EXPLORER` |
| Survol d'une compétence | `INSPECTER` |
| Survol d'un bouton | `OUVRIR` |
| Visualisation interactive | `INTERAGIR` |

---

## Le canvas persistant — pattern validé

Voir `prototype-persistance-canvas/` pour l'implémentation de référence.

1. Le composant Canvas (`'use client'`) est rendu dans `app/layout.tsx`, **jamais**
   dans un `page.tsx` ou un `layout.tsx` de segment.
2. Il lit `usePathname()` pour dériver son état (couleur, comportement) — jamais
   pour se démonter/remonter.
3. Tout état initialisé une seule fois (seed, timestamp de montage, RNG) doit
   l'être dans un `useEffect` côté client, **jamais** pendant le rendu initial
   (`useState(() => ...)` calculé au rendu casse l'hydratation SSR — piège
   rencontré et corrigé dans le prototype).
4. Budget mesuré : chunk 3D (three.js + R3F) ≈ 234 Ko gzip, incompressible pour ce
   stack. Il charge **en parallèle** du texte dès le premier rendu — jamais
   bloquant pour le LCP.

---

## Data DNA — schéma et données

- Schéma des nœuds/arêtes : `PORTFOLIO-SOURCE-DE-VERITE-v4.md` §04.5
- Données figées : `data/nodes.json` (29 nœuds) / `data/edges.json` (60 arêtes)
- **Règle non négociable :** toute arête doit être dérivée d'une grille §04.4
  réelle. Jamais d'arête ajoutée « par cohérence supposée ». Champ `null` pour
  tout attribut non applicable à un type de nœud plutôt qu'une valeur inventée.
- **Le Data DNA ne représente pas tout ce que Rayan sait utiliser. Il représente
  les relations qui expliquent comment il construit.** Une technologie réelle
  mais narrativement incidentale (infra générique, dépendance secondaire) ne
  mérite pas un nœud dans le graphe principal — elle reste en texte dans la
  page du projet. Une arête doit être à la fois réelle **et** significative.
- **Dataset source ≠ graphe affiché** (acté le 2026-09-05, §04.7) :
  `data/*.json` = **29 nœuds / 60 arêtes** (source, ne change pas) ; le graphe
  narratif réellement affiché = **27 nœuds / 53 arêtes**. La dérivation est
  *calculée* (`deriveNarrativeGraph`), jamais une liste codée en dur : retrait
  du nœud `output` (`BUILD` — tautologique) puis de tout nœud restant sans
  arête (aujourd'hui `power-bi`).
- `BUILD` reste un **concept éditorial** du site (la boucle `FRICTION →
  COMPRENDRE → CONSTRUIRE → AUTOMATISER → ITÉRER`), **pas un nœud du graphe**.
- Le retrait d'un nœud **ne se signale jamais au visiteur** : le Data DNA
  raconte le profil, pas les décisions de construction du Data DNA.
- **Rendu visuel validé le 2026-09-05** (§04.8, `prototype-persistance-canvas`,
  route `/data-dna`) : 2D SVG pour la page, 3D pour le halo du Hero — mêmes
  données, deux niveaux de lecture. Positions issues d'une simulation de forces
  déterministe ; **les piliers ne sont jamais ancrés à des positions choisies**.
  L'asymétrie du graphe est une information sur le profil : ne pas la
  corriger. (Le cluster `ML` qui servait d'exemple ici a été retiré le
  2026-09-07 : ses deux compétences n'étaient portées que par un seul projet,
  lui-même sans données ni recul. La règle vaut toujours pour les asymétries
  restantes.)
- **C'est l'interaction qui rend le Data DNA supérieur à une liste**, pas le
  graphe statique. Conséquence : la page ne peut pas être une image, et le
  fallback sans JS doit être une liste structurée réelle.

---

## Seuils de performance (mesurés — D-12)

| Budget | Seuil | Mesuré |
|---|---|---|
| JS texte/interface (hors 3D) | < 200 Ko gzip | 172 Ko (prototype minimal) |
| Chunk 3D (three.js + R3F) | < 260 Ko gzip | 234 Ko (mesh unique, sans `drei`) |
| LCP mobile 4G | < 2,0 s | non mesuré — dépend du découplage LCP texte / 3D |
| Data System | 60 fps desktop, plancher 30 fps | non mesuré — scène minimale seulement |
| Route Job Agent (WebGL) | < 1,5 Mo transférés | non mesuré |
| Lighthouse | perf ≥ 90 desktop / ≥ 80 mobile, a11y 100 | non mesuré |
| Draw calls scène 3D | < 100 | non mesuré |

Le texte ne doit **jamais** attendre le 3D. Le 3D charge en parallèle dès `/`,
pas après une interaction.

---

## Ce qui ne varie jamais entre univers de projet (§03.6)

Familles typographiques · échelle typographique et graisses · grille et marges ·
échelle d'espacement · comportement du curseur · règles de motion (durées,
easings) · structure de page en six sections · composants de navigation et
bouton retour · grain de fond.

**Ce qui peut varier :** couleur d'accent · type de visualisation (3D, dataviz,
éditorial) · illustration propre · densité et rythme de mise en page · vocabulaire
de formes secondaires · ambiance de la scène interactive.
