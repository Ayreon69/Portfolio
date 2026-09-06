# PLAN D'INTÉGRATION — Data DNA dans la homepage

> **Statut : plan technique, aucune implémentation.** Rédigé le 2026-09-05, après
> validation du prototype visuel (§04.8). Objectif unique : répondre à
> *« comment le Data DNA existe-t-il dans le flux de la homepage ? »* avec assez
> de précision pour que l'itération suivante code sans rouvrir une décision.
>
> **Rien dans ce plan ne rouvre l'état canonique** : 27 nœuds / 53 arêtes,
> `BUILD` supprimé, `Power BI` hors graphe narratif, positions dérivées des
> arêtes, relations `feeds` / `uses` uniquement.

---

## 1. Architecture actuelle pertinente

**Il n'existe pas encore de site réel.** Le seul projet Next du dépôt est
`prototype-persistance-canvas/` (dépôt git autonome, branche `master`).

```
Portfolio/
├── data/nodes.json · edges.json        ← SOURCE canonique (29 / 60)
├── PORTFOLIO-SOURCE-DE-VERITE-v4.md · design-system.md · CLAUDE.md
├── wireframe-homepage-lofi.html        ← structure de homepage validée
└── prototype-persistance-canvas/       ← Next 16.3.4 (Turbopack), React 19.2.8
    ├── app/layout.tsx                  ← canvas persistant (§07.1) — VALIDÉ
    ├── app/page.tsx                    ← Hero réel (§08.1) — VALIDÉ
    ├── app/data-dna/page.tsx           ← prototype Data DNA (§04.8) — VALIDÉ
    ├── app/laboratoire/page.tsx        ← test de persistance, jetable
    ├── components/PersistentScene.tsx · DataDNAHero.tsx
    ├── lib/graph-layout.ts             ← deriveNarrativeGraph + layoutGraph (2D)
    ├── lib/data-dna-layout.ts          ← computeLayout (3D, halo Hero)
    ├── lib/system-visibility.tsx
    └── public/data/nodes.json · edges.json   ← COPIE manuelle de data/
```

Dépendances : `@react-three/fiber` 9.7, `three` 0.185, `@react-three/drei` 10.7
(installé, **non utilisé** — le budget mesuré de 234 Ko gzip est sans `drei`),
`tailwindcss` 4 (installé, **non utilisé** — tout est en styles inline).

### Cinq écarts à traiter à l'intégration (constats factuels, pas des opinions)

| # | Constat | Conséquence |
|---|---|---|
| **É-1** | `DataDNAHero.tsx` appelle `computeLayout(rawNodes, rawEdges)` sur les données **brutes**. Vérifié à l'exécution : `build` **et** `power-bi` sont dans le halo. | Le Hero et la section PROFIL affichent **deux systèmes différents**. Contredit « mêmes données, deux représentations ». |
| **É-2** | Les deux vues chargent les données par `fetch()` dans un `useEffect`. | **Sans JS : rien.** Contredit §10.2 (fallback rendu côté serveur) et la règle non négociable de `CLAUDE.md`. |
| **É-3** | `public/data/*.json` est une copie manuelle de `data/*.json` (aujourd'hui identiques, vérifié). | Divergence garantie à terme. Deux vérités pour une donnée canonique. |
| **É-4** | `app/globals.css` est encore le boilerplate `create-next-app` (fond blanc, `prefers-color-scheme: dark`). Neutralisé par des styles inline sur `<body>`. | Contredit §03.3. À remplacer par les tokens réels avant toute page. |
| **É-5** | `placeLabels`, `nodeRadius`, `labelFontSize`, `isStructural`, `relationGroups`, `LAYERS` vivent **dans** `app/data-dna/page.tsx`. | Non réutilisables hors du prototype. À extraire sans les modifier. |

---

## 2. Composants à réutiliser

### Réutilisables tels quels — aucune modification de logique

| Élément | Fichier actuel | Rôle dans le site |
|---|---|---|
| `deriveNarrativeGraph()` | `lib/graph-layout.ts` | Contrat 29/60 → 27/53. **Ne pas toucher.** |
| `layoutGraph()` + `seededFraction` | `lib/graph-layout.ts` | Simulation déterministe 2D. **Ne pas toucher.** |
| `computeLayout()` + `PILLAR_ANGLE` | `lib/data-dna-layout.ts` | Layout radial 3D du halo Hero. |
| `EdgeLines`, `Nodes` | `components/DataDNAHero.tsx` | Rendu three.js du halo (1 draw call pour les arêtes). |
| Oscillation bornée + parallax | `components/DataDNAHero.tsx` | Contrainte de composition du Hero (§08.1). |
| Pattern du canvas persistant | `app/layout.tsx` + `PersistentScene.tsx` | §07.1. Architecture validée, conservée. |
| `SystemVisibilityProvider` | `lib/system-visibility.tsx` | Sert déjà le test d'acceptation « sans système ». |

### À extraire de `page.tsx` vers des modules partagés — copie littérale

`placeLabels` · `labelFontSize` · `isStructural` · `nodeRadius` · `LAYERS` ·
`relationGroups` · le `<svg>` complet · le panneau de détail · `WeightBar`.

> Règle de l'extraction : **déplacement, pas réécriture.** Le comportement validé
> (placement anti-collision, ordre de peinture, `feeds` plein / `uses` pointillé,
> groupes `ALIMENTE` / `UTILISE` / `ALIMENTÉ PAR` / `UTILISÉ PAR`, poids brut,
> `scrollbar-gutter: stable`) est une référence de comportement.

### À ne pas reprendre

- `RotatingMesh` (mesh de démonstration) et `app/laboratoire/page.tsx` (test).
- Le châssis du prototype : les 5 questions, le bandeau « diagnostic de
  prototype », l'en-tête « PROTOTYPE — NON INTÉGRÉ ».
- **Le sélecteur A / B / C.** A et B étaient des *instruments de test*, pas des
  modes destinés au visiteur. Le site rend **B + C en un seul état** (hiérarchie
  visible en permanence, interaction au survol/clic). *Point à confirmer :
  c'est un resserrement, pas une décision déjà actée.*

---

## 3. Composants à créer

```
lib/data-dna/
  source.ts       import statique de data/*.json + deriveNarrativeGraph()
                  → exporte LE graphe narratif (27/53). Aucun fetch, aucun réseau.
  layout-2d.ts    layoutGraph + placeLabels + nodeRadius (extraits, inchangés)
  layout-3d.ts    computeLayout (extrait, inchangé)
  relations.ts    relationGroups (extrait, inchangé)

components/data-dna/
  DataDNAGraph.tsx      'use client' — le <svg> 27/53 + survol/clic. aria-hidden.
  DataDNAPanel.tsx      'use client' — panneau de détail (overlay / sous canvas)
  DataDNAIndex.tsx      SERVEUR — la liste structurée : fallback, mobile, SEO, a11y
  DataDNASurface.tsx    'use client' — décide index seul vs index + graphe

components/hero/
  HeroHalo.tsx          le halo 3D, alimenté par le MÊME graphe narratif (corrige É-1)
```

`DataDNAIndex.tsx` n'est pas à inventer : c'est la grille 4 clusters du
`wireframe-homepage-lofi.html` (section PROFIL), dont les liens sont déjà dérivés
de `data/edges.json`.

---

## 4. Fichiers qui devront être modifiés

| Fichier | Modification |
|---|---|
| `app/layout.tsx` | Conserver `PersistentScene`. Remplacer les styles inline de `<body>` par les tokens de `globals.css`. |
| `app/globals.css` | Remplacer le boilerplate par les tokens §03.3 / §03.4 (É-4). |
| `app/page.tsx` | Devient la homepage réelle : HERO → PHILOSOPHIE → **PROFIL** → LABORATOIRE → PARCOURS → CV → CONTACT. |
| `components/PersistentScene.tsx` | Piloter l'état du système par section visible, pas seulement par `pathname`. Retirer `RotatingMesh`. |
| `components/DataDNAHero.tsx` | **Une seule ligne de fond** : consommer le graphe narratif au lieu des données brutes (É-1). Layout, oscillation, décalage : inchangés. |
| `app/data-dna/page.tsx` | Réduit à un import des composants extraits — reste comme banc d'essai. |
| `tsconfig.json` | Rien si le site est à la racine (`@/*` couvre déjà `data/`, `resolveJsonModule` est activé). |
| `public/data/` | **Supprimé** (É-3). |

**Jamais modifiés :** `data/nodes.json`, `data/edges.json`, `deriveNarrativeGraph()`,
`layoutGraph()`, les poids, la typologie des nœuds.

---

## 5. Stratégie de partage des données Hero ↔ PROFIL

### Une seule dérivation, calculée une fois, côté serveur

```
data/nodes.json (29)  ─┐
data/edges.json (60)  ─┴─→ import STATIQUE (resolveJsonModule, déjà activé)
                             │
                             ▼
                    deriveNarrativeGraph()      ← inchangé
                             │
                    graphe narratif 27 / 53
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
   layout-3d           layout-2d            DataDNAIndex
   (halo Hero)      (graphe PROFIL)      (HTML structuré)
```

Trois points non négociables :

1. **Import statique, plus aucun `fetch`.** Les données entrent dans le bundle au
   build. C'est ce qui rend le rendu serveur possible — donc le fallback (É-2).
2. **`data/` à la racine reste l'unique source.** `public/data/` disparaît (É-3).
3. **Le Hero et PROFIL partagent le même jeu `nodes`/`edges` dérivé.** Seul le
   *layout* diffère (radial 3D vs force 2D). C'est précisément ce qui rend vraie
   la phrase « mêmes données, deux niveaux de représentation ».

**Ce qui ne se partage pas :** les positions. Le halo garde son layout radial
compact, PROFIL garde sa simulation de forces. Aucune position n'est recalculée
pour le site : `layoutGraph` tourne une fois, ses paramètres restent figés.

### Où placer le site

`data/`, le blueprint, le design system et `CLAUDE.md` sont **à la racine**. Le
site réel doit donc être un projet Next **à la racine du dépôt**, où `@/data/…`
résout naturellement. `prototype-persistance-canvas/` est **gelé** comme
référence de comportement (dépôt git autonome, non supprimé).

---

## 6. Stratégie WebGL / fallback

### Précision nécessaire

**Le Data DNA de PROFIL est du SVG/DOM, pas du WebGL.** Le WebGL ne concerne que
le halo du Hero. Donc :

| Absence | Hero | PROFIL |
|---|---|---|
| **WebGL** | halo absent, texte intact (test d'acceptation §08.1 déjà passé) | **aucun impact** |
| **JavaScript** | texte intact (HTML réel) | l'index structuré, rendu serveur |
| **`reduced-motion`** | système figé | graphe figé, interaction conservée |

La vraie question pour PROFIL n'est donc pas « sans WebGL » mais **« sans JS »**.

### Les trois couches (§10.3), du socle vers l'enrichissement

```
1. SERVEUR — DataDNAIndex : 4 clusters, projets liés, compétences, relations.
             Toujours dans le HTML. Crawler · lecteur d'écran · no-JS · mobile.
2. CLIENT  — DataDNAGraph : le SVG 27/53 monté par-dessus si
             (pointer: fine) ET largeur ≥ 900 px ET JS actif.
3. CLIENT  — interaction niveau C : survol / clic / Échap + panneau.
```

### Accessibilité — éviter la double lecture

Quand le graphe est monté, il porte `aria-hidden="true"` et `role="img"` avec un
libellé de synthèse ; `DataDNAIndex` reste dans le DOM, **masqué visuellement
mais lisible par les technologies d'assistance**. Un seul contenu accessible, pas
deux. Le graphe est un encodage visuel de l'index, pas un contenu concurrent.

### Interdit

Jamais de capture d'image du graphe en fallback (règle explicite). Le fallback
est du texte structuré, dérivé des mêmes arêtes.

---

## 7. Stratégie desktop / mobile

Rien à inventer : §10.1 et §10.4 sont déjà validés.

> **Desktop = système spatial · Mobile = système indexé.** La donnée est
> identique, la représentation change.

| | Desktop | Mobile |
|---|---|---|
| **HERO** | halo 3D, oscillation bornée, parallax souris | constellation légère en fondu 2 s **puis figée**, sans convergence (§10.4) |
| **PROFIL** | graphe 27/53 + niveau C + panneau en overlay | `DataDNAIndex` : clusters dépliables, tap sur une compétence → projets liés |
| **Panneau** | overlay dans la bande périphérique libre (calculée) | sous le canvas (< 900 px) — comportement déjà implémenté et testé |

Détection **par capacité, pas par user-agent** (§10.3) :
`matchMedia('(pointer: fine)')` et `matchMedia('(prefers-reduced-motion: reduce)')`.

Le seuil de 900 px du prototype et la bascule `pointer` se cumulent : le graphe
n'est monté que si les deux conditions sont réunies.

Règles §10.5 applicables : cible de tap 44 px, **aucun état dépendant du hover
sans équivalent au tap**, pas de curseur contextuel sur mobile.

### Deux corrections de contenu à faire au passage (dérivées des données, pas ajoutées)

- §10.4 liste `AI / AUTOMATION / DATA` — écrit **avant** l'arbitrage A-10. Le
  mobile doit lister **4 clusters**, `ML` compris. Son caractère périphérique
  (§04.8) apparaît de lui-même : sa liste est courte.
- Le wireframe affiche « PYTHON → présent dans les 5 systèmes ». Le graphe réel
  dit **7** (5 expérimentations + 2 expériences). Le chiffre doit être **calculé**
  depuis `edges.json`, jamais écrit en dur. Même remarque pour le
  « UTILISÉ DANS 03 EXPÉRIMENTATIONS » de §08.3, illustratif à l'époque.

---

## 8. Transition Hero → PROFIL

Contrainte posée : **pas de travelling caméra, pas de navigation 3D, le scroll
reste un scroll, et la lecture du contenu ne dépend jamais de la transition.**

Mécanisme retenu — le plus simple qui respecte §04.6 (« un même système qui
change d'état, jamais une animation indépendante ») :

1. `PersistentScene` reste **monté en permanence** dans `app/layout.tsx`. Il ne
   se démonte ni ne se recrée en descendant la page.
2. Un `IntersectionObserver` sur les sections donne au canvas un **état courant**
   (`hero` → `philosophie` → `profil`…). Le canvas lit cet état comme il lit
   déjà `usePathname()`.
3. À l'entrée de PROFIL, le halo **s'efface en opacité** ; le graphe 2D de PROFIL
   est déjà présent dans le flux. Deux représentations du même système : l'une se
   retire, l'autre prend le relais.
4. Sous `prefers-reduced-motion`, le fondu est instantané.

Pourquoi une opacité et pas un morphing halo 3D → graphe 2D : le morphing
imposerait un layout commun aux deux représentations, donc **des positions
choisies pour la transition** — ce qui violerait la règle « aucune position
choisie manuellement ». Le fondu ne coûte aucune concession.

---

## 9. Structure DOM de la section PROFIL

```html
<section id="profil" aria-labelledby="profil-titre">
  <p class="eyebrow">03 — PROFIL</p>            <!-- numérotation §03.5 -->
  <h2 id="profil-titre">Compétences connectées au système</h2>

  <p class="intro">                              <!-- 1 phrase, pas de remplissage -->
    Pas de timeline, pas de barres de pourcentage : chaque lien ci-dessous
    vient du graphe réel.
  </p>

  <div class="dna-surface">
    <!-- SERVEUR, toujours présent -->
    <DataDNAIndex />        <!-- 4 clusters → compétences → projets liés -->

    <!-- CLIENT, monté par-dessus si pointer:fine ET ≥ 900px -->
    <DataDNAGraph aria-hidden="true" role="img" />
    <DataDNAPanel />        <!-- overlay desktop / sous le canvas en mobile -->
  </div>

  <p class="legend">        <!-- légende minimale, reprise du prototype -->
    Taille = poids cumulé réel des arêtes. Trait plein : alimente. Pointillé : utilise.
  </p>
</section>
```

Ce qui n'y est pas, volontairement : aucun paragraphe explicatif supplémentaire,
aucun compteur décoratif, aucune mention des nœuds retirés (le visiteur n'a pas à
connaître les décisions de construction du Data DNA — §04.7).

---

## 10. Ordre exact des prochaines étapes

| # | Étape | Ne touche pas à |
|---|---|---|
| **1** | Créer le projet Next **à la racine**, en reprenant `app/layout.tsx` et le pattern du canvas persistant. Geler `prototype-persistance-canvas/`. | `data/*.json` |
| **2** | `app/globals.css` : tokens §03.3 / §03.4 en remplacement du boilerplate (É-4). | — |
| **3** | `lib/data-dna/source.ts` : import statique de `data/*.json` + `deriveNarrativeGraph()`. Supprimer `public/data/` (É-2, É-3). **Assertion de non-régression : 27 nœuds / 53 arêtes.** | `deriveNarrativeGraph()` |
| **4** | Extraire `layout-2d.ts`, `layout-3d.ts`, `relations.ts` depuis le prototype — **déplacement littéral** (É-5). | la logique extraite |
| **5** | `DataDNAIndex.tsx` (serveur) depuis la grille PROFIL du wireframe, chiffres **calculés** depuis les arêtes. | `edges.json` |
| **6** | `DataDNAGraph.tsx` + `DataDNAPanel.tsx` : portage du SVG et du panneau validés. | le comportement validé |
| **7** | `DataDNASurface.tsx` : détection `pointer:fine` + ≥ 900 px + `reduced-motion`, montage du graphe par-dessus l'index. | — |
| **8** | Brancher `HeroHalo` sur le **graphe narratif** (É-1). Une ligne. | oscillation, décalage, rayons |
| **9** | `IntersectionObserver` → état de section dans `PersistentScene`, fondu du halo à l'entrée de PROFIL. Retirer `RotatingMesh`. | la persistance du canvas |
| **10** | Tests de non-régression : JS désactivé (l'index doit rester lisible) · `pointer: coarse` · `reduced-motion` · 375 px · géométrie du graphe inchangée à l'ouverture du panneau · `tsc --noEmit`. | — |

Les étapes 1 à 4 sont de la plomberie sans décision. La première étape qui produit
quelque chose de visible est la **5**.

---

## Décisions à confirmer avant de commencer

1. **Site à la racine du dépôt**, prototype gelé comme référence — plutôt que de
   renommer le prototype en site.
2. **Pas de sélecteur A / B / C sur le site.** A et B étaient des instruments de
   test ; le site rend B + C en un seul état.

Aucune des deux ne modifie les données, le graphe, ni le comportement validé.
