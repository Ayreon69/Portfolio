# PORTFOLIO — SOURCE DE VÉRITÉ

**Projet :** Portfolio personnel — Rayan Jemai
**Version :** v4.0
**Dernière mise à jour :** 2026-09-04
**Statut global :** blueprint conceptuel complet · blueprint fonctionnel à construire

---

## Sommaire

```
00 — INTENTION & CRITÈRES DE RÉUSSITE
01 — POSITIONNEMENT
02 — PHILOSOPHIE
03 — DIRECTION ARTISTIQUE
04 — DATA DNA
05 — UX & PARCOURS RECRUTEUR
06 — MOTION
07 — ARCHITECTURE & ROUTING
08 — SECTIONS
09 — EXPÉRIMENTATIONS
10 — MOBILE & ACCESSIBILITÉ
11 — DIRECTION TECHNIQUE
12 — WIREFRAMES
13 — ROADMAP

A — Registre des arbitrages
B — Registre des décisions ouvertes
C — Références
D — Changelog
```

**Convention de statut :** `VALIDÉ` (arrêté) · `QUASI` (direction arrêtée, valeurs ouvertes) · `CONCEPT` (principe arrêté, contenu à produire) · `OUVERT` (rien de tranché).

---

# 00 — INTENTION & CRITÈRES DE RÉUSSITE

## 00.1 Expérience recherchée — `VALIDÉ`

Les deux réactions visées chez un recruteur :

> **« Il est clairement très à l'aise avec les nouvelles technologies. »**
> **« J'ai envie de parler avec lui et de savoir ce qu'il pourrait construire chez nous. »**

Et l'intention qui sous-tend toutes les décisions du document :

> **Le portfolio doit donner envie de recruter Rayan pour sa capacité à transformer un problème en système, pas simplement pour sa maîtrise d'une stack technique.**

## 00.2 Principe directeur — `VALIDÉ`

Au même niveau hiérarchique que la philosophie. C'est le critère qui tranche les décisions ambiguës.

> **Le site ne dit pas « regardez comme je sais faire du Web ».**
> **Il dit « regardez ce que je suis capable de construire avec la technologie ».**

Conséquence pratique : devant un choix entre un effet impressionnant et une démonstration lisible de ce qui a été construit, la démonstration gagne. Toujours.

> **« Ce site n'est pas une vitrine. C'est un système. »**

## 00.3 Test de cohérence — `VALIDÉ`

Une décision de design ou de développement est cohérente si la réponse est **oui** aux cinq questions :

1. Est-ce que cela rend le profil ou un projet plus compréhensible, plus explorable ou plus mémorable ?
2. Est-ce que cela maintient une navigation immédiate pour un recruteur pressé ?
3. Est-ce que cela sert la philosophie `FRICTION → COMPRENDRE → CONSTRUIRE → AUTOMATISER → ITÉRER` ?
4. Est-ce que cela conserve l'équilibre 60 % lisibilité / 40 % expérimentation ?
5. Est-ce que le résultat ressemble à un laboratoire data personnel et premium — plutôt qu'à une démo d'effets web ?

> **À copier tel quel dans le `CLAUDE.md`.**

## 00.4 Definition of Done — `VALIDÉ` (seuils perf en `OUVERT`)

Le site est réussi si, et seulement si :

**Clarté**
- [ ] Le positionnement est compris en **moins de 10 secondes**
- [ ] Un visiteur sait dire, après la page d'accueil, ce que Rayan construit — pas seulement ce qu'il sait faire

**Navigation**
- [ ] CV accessible en **≤ 2 clics** depuis n'importe quelle page
- [ ] Chaque expérimentation accessible directement par URL
- [ ] Le bouton retour du navigateur fonctionne partout
- [ ] Aucun contenu inaccessible sans passer par une animation

**Projets**
- [ ] Chaque expérimentation est compréhensible en **moins d'une minute**
- [ ] Chaque expérimentation possède **au moins une preuve concrète** (chiffre, démo, capture, dépôt)
- [ ] Aucune expérimentation n'expose de donnée confidentielle

**Technique**
- [ ] Le WebGL ne bloque **jamais** la navigation
- [ ] Le site reste entièrement utilisable **sans WebGL**
- [ ] Le contenu est lisible **sans JavaScript** (crawler, lecteur d'écran)
- [ ] Mobile = représentation différente, jamais une simple réduction
- [ ] `prefers-reduced-motion` respecté partout

**Performance** — seuils validés le 2026-09-05, mesurés sur le prototype §07.1 (D-12)
- [x] LCP < 2,0 s sur mobile milieu de gamme en 4G *(non mesuré directement — dépend de la stratégie de LCP découplé du 3D ci-dessous, à revérifier une fois le hero réel construit)*
- [x] **JS « texte / interface », hors chunk 3D : < 200 Ko gzip** — mesuré à **172 Ko** sur le prototype minimal (framework Next.js + polyfills + React, sans 3D). Seuil tenu, marge de ~28 Ko avant d'ajouter GSAP/Lenis/Motion.
- [x] **Chunk 3D (three.js + R3F) : < 260 Ko gzip** — mesuré à **234 Ko**, stable même avec le vrai Data DNA du Hero (29 nœuds, 60 arêtes) chargés en plus. Poids jugé incompressible pour ce stack (three.js seul). Chargé **en parallèle** du texte dès le premier rendu, jamais bloquant pour lui.
- [x] **Polices (Bodoni Moda + IBM Plex Mono/Sans) : mesuré à 94 Ko** (woff2, self-hosted via `next/font`, un seul poids/style par police réellement téléchargé sur le Hero, pas les 25 fichiers générés au build). Budget total mesuré du Hero réel : ≈ 172 (texte/interface) + 234 (3D) + 94 (polices) = **≈ 500 Ko** au premier chargement.
- [ ] Data System : 60 fps desktop, plancher 30 fps *(non mesuré — nécessite la scène réelle avec tous les nœuds, pas un mesh unique)*
- [ ] Route Job Agent : < 1,5 Mo transférés au total
- [ ] Lighthouse : perf ≥ 90 desktop / ≥ 80 mobile · accessibilité 100
- [ ] Moins de 100 draw calls dans la scène 3D

> **Tension découverte et résolue (voir A-11) :** l'ancien seuil disait « hors chunk 3D chargé à la demande », ce qui contredisait la chorégraphie hero du §08.1 (le système est visible dès 0-1 s, donc chargé dès le premier rendu — pas « à la demande » au sens classique du terme). Les deux budgets sont maintenant **séparés et mesurés indépendamment** : le texte/interface ne doit jamais attendre le 3D (LCP protégé), mais le 3D charge en parallèle dès `/`, pas après un clic.

---

# 01 — POSITIONNEMENT — `VALIDÉ`

**Identité :** Data Scientist qui utilise l'IA et l'automatisation pour construire des systèmes.

**Hiérarchie (ordre C > A > B validé) :**

```
1. AI Builder / Automation          ← ce que le site met en avant
2. Data Scientist                   ← le socle
3. Data Engineer / Analytics Eng.   ← présent, non mis en avant
```

> Le portfolio ne doit **pas** vendre un profil Data généraliste.

**Anti-patterns rejetés :**
- ❌ `Photo → À propos → Compétences → 4 cartes → CV → Contact`
- ❌ Slogan marketing générique
- ❌ Statistiques creuses (« 37 projets · 14 certifications »)
- ❌ Barres de compétences en pourcentage

---

# 02 — PHILOSOPHIE — `VALIDÉ`

**Fil rouge :** « Je n'aime pas faire deux fois la même chose. »

Traité comme la **règle fondamentale du système**, pas comme un slogan commercial.

**Sous-titre explicatif :** *Quand une tâche devient répétitive, je cherche à en faire un système.*

**Signature professionnelle :** *Je construis des systèmes qui suppriment le travail répétitif.*

**Boucle conceptuelle — version unique et définitive :**

```
FRICTION → COMPRENDRE → CONSTRUIRE → AUTOMATISER → ITÉRER
```

> Quatre variantes ont circulé dans les sources antérieures. **Celle-ci seule fait foi.**

Le portfolio devient une démonstration de sa propre philosophie : *tu n'as pas seulement parlé d'automatisation, tu as automatisé la façon dont tu présentes ton travail.*

---

# 03 — DIRECTION ARTISTIQUE — `QUASI`

## 03.1 Concept — `VALIDÉ`

**Laboratoire éditorial** — un laboratoire numérique présenté comme une publication haut de gamme. La technologie est dans les **interactions et les systèmes**, jamais dans des éléments visuels « tech » ajoutés artificiellement.

**Piège nommément identifié :**
> Crème + serif + petites lignes + texte minuscule = « portfolio design » générique.
> **La technologie doit casser légèrement cette sobriété.**

```
1er regard        → élégant
2e regard         → technique
après exploration → « Ah ouais, il a vraiment construit ça. »
```

**Ambiance :** intellectuel / expérimental × élégant / premium. Calme, précision, espace, confiance.
> Peu d'éléments simultanés, chacun très travaillé. **Animations sophistiquées plutôt que nombreuses.**

**Interdits :** hacker terminal · dashboard Power BI · démo futuriste générique · cyberpunk · noir + violet néon · grille de 4 cartes · Inter / Roboto / Arial / Space Grotesk · audio.

## 03.2 Niveau d'expérimentation — `VALIDÉ`

**Ambition 4/5** · **60 % lisibilité / 40 % expérimentation**

**Règle d'arbitrage :** l'expérimentation est dans le **contenu et les représentations**, jamais dans la **mécanique de navigation**.

**Règle de justification :**
> **Chaque effet doit avoir une justification.**
> Three.js pour représenter une relation. Une visualisation pour expliquer une donnée. Une transition pour créer une continuité. Une interaction pour permettre une exploration.
> Pas : « Regardez, j'ai fait un shader. »

**🛑 Gel des effets — `VALIDÉ` :**
> On arrête d'ajouter des effets. WebGL, système data, particules, interactions, curseur contextuel, transformations, transitions, environnements projet, changements de fond : **c'est suffisant.**
> La question n'est plus « qu'est-ce qu'on peut ajouter ? » mais « comment rendre tout ça cohérent, performant et réellement impressionnant ? »

## 03.3 Couleurs — `VALIDÉ` (valeurs hex figées le 2026-09-05 — D-05)

| Rôle | Hex | Usage narratif |
|---|---|---|
| **Crème / off-white** | `#F4EFE4` | Base : identité éditoriale, lisibilité, espace, maturité |
| **Noir profond** | `#0D0D0F` | Immersion : expérimentations, 3D, data system |
| **Ton chaud secondaire** | `#8A7F6A` | Bordures, texte discret sur fond crème |
| **Accent Job Agent** | `#E0704A` | Ambre chaud — déjà utilisé dans le prototype de persistance (§07.1) |
| **Accent ARAM Stats** | `#3E8E7E` | Teal sourd — évite le vert néon gaming attendu |
| **Accent Commission Bot** | `#B08D3E` | Or mat — finance sans le cliché vert dollar |
| **Accent AI Watch** | `#4A6FA5` | Bleu ardoise — information / flux |
| **Accent Churn Prediction** | `#8C3B3B` | Bordeaux mat — gravité assurance / ML |

> Les couleurs de projet ne doivent jamais transformer le site en portfolio multicolore —
> chaque accent n'apparaît que dans sa propre page (§03.6). Contraste WCAG à revérifier en
> phase design détaillé (texte sur accent notamment), cette étape ne fige que les teintes.

**Chorégraphie des fonds :**

| Section | Fond |
|---|---|
| ACCUEIL / HERO | Crème |
| PHILOSOPHIE | Crème |
| PROFIL | Crème |
| LABORATOIRE | **Noir** |
| Page expérimentation | **Noir** + accent projet |
| PARCOURS | Crème |
| CV | Crème |
| CONTACT | **Noir** |

## 03.4 Typographie — `VALIDÉ` (familles figées le 2026-09-05 — D-06)

| Usage | Famille | Direction |
|---|---|---|
| `RAYAN JEMAI`, grands titres | **Bodoni Moda** | Serif à très fort contraste, registre magazine/fashion haut de gamme |
| Rôle, `EXP. 003`, `2026.09`, métriques, labels | **IBM Plex Mono** | Identité technique/ingénierie, contraste net avec le serif classique |
| Texte courant | **IBM Plex Sans** | Neutre, même famille de dessin que Plex Mono — cohérence sans troisième personnalité typographique |

> **Le contraste entre très gros et très petit doit être très marqué.** Bodoni Moda (très
> haut contraste de graisse, hairlines fines) interrompu par IBM Plex Mono (dessin
> technique, monospace) porte à lui seul la tension « objet éditorial imprimé × système
> numérique » du §03.5 — aucune troisième police n'est nécessaire pour ça.

**Contrainte française vérifiée (2026-09-05) :** les trois familles sont sur Google Fonts,
dont le sous-ensemble `latin` de base (`unicode-range U+0000-00FF` + `U+0152-0153`) couvre
nativement tous les diacritiques français (é è ê à ç ù û î ô), le ligature `œ`/`Œ` et les
guillemets `« » (U+00AB/U+00BB)` — aucune n'a besoin d'un sous-ensemble étendu spécial.
Prévoir les espaces insécables avant `? ! : ;` reste une règle de composition, pas une
limite de police.

## 03.5 Formes et texture — `VALIDÉ`

**Formes :** lignes fines · cercles / nœuds · points · grilles · coordonnées · petites croix · blocs de données · particules · formes organiques discrètes. ❌ Pas de gros éléments cyberpunk.

**Texture :** grain analogique **presque imperceptible** sur le fond.
> Raison : éviter que noir/crème + WebGL donne une impression trop « logiciel ». Objectif : **technologie numérique × objet éditorial imprimé**.

**Composition :** grandes marges · espace négatif · grille éditoriale · lignes fines · petites annotations · numérotation des expérimentations · éléments pouvant légèrement sortir de la grille.

## 03.6 Règle « même ADN, univers différents » — `VALIDÉ`

> **Chaque expérimentation peut avoir son propre univers visuel, mais appartient toujours au même système éditorial global.**

Pour que cette règle soit applicable et pas seulement une intention, voici ce qui varie et ce qui ne varie jamais :

| ✅ Peut varier par expérimentation | ❌ Ne varie jamais |
|---|---|
| Couleur d'accent | Familles typographiques |
| Type de visualisation (3D, dataviz, éditorial) | Échelle typographique et graisses |
| Illustration ou imagerie propre | Grille et marges |
| Densité et rythme de la mise en page | Échelle d'espacement |
| Vocabulaire de formes secondaires | Comportement du curseur |
| Ambiance de la scène interactive | Règles de motion (durées, easings) |
| | Structure de page en 6 sections |
| | Composants de navigation et bouton retour |
| | Grain de fond |

> Test : si un visiteur passe de l'expérimentation 01 à la 04, il doit sentir un changement d'univers **sans jamais douter d'être sur le même site**.
> Cette règle existe pour une raison précise : sans elle, tu auras six designs différents dans six mois.

---

# 04 — DATA DNA — `STRUCTURE VALIDÉE` / données à construire

## 04.1 Nature du système

Signature graphique du portfolio. **Système hybride réseau neuronal × infrastructure data.**

> Objectif : qu'on ne puisse **pas** dire immédiatement « ah, c'est juste un réseau de neurones en 3D ».

| Élément | Représente |
|---|---|
| Nœuds | Compétences, projets, expériences |
| Connexions | Relations entre ces éléments |
| Flux | Données qui circulent |
| Modules | Domaines du profil |
| Clusters | Groupes de projets ou compétences |
| Particules | Activité / vie du système |

Rendu propre et abstrait. **Pas symétrique ni parfaitement organisé** : connexions qui apparaissent, disparaissent, se déplacent.

## 04.2 Topologie — `VALIDÉ` (révisée v4.7 — ajout du cluster ML)

`BUILD` n'est **pas** un cinquième domaine, c'est **la sortie du système**.

```
                 AI
                  \
                   \
        ML ────────  BUILD
       /             /
      /             /
 AUTOMATION ───────/
      \
       \
       DATA
```

- **AI** = centre de gravité, le plus gros cluster — IA générative / LLM / agents
- **ML** = apprentissage supervisé / modèles prédictifs / statistiques appliquées — **distinct de AI**, pas une sous-compétence de DATA
- **AUTOMATION** = la manière de résoudre les problèmes, traverse les trois autres clusters, pas une simple compétence
- **DATA** = infrastructure, ce qui permet au reste d'exister
- **BUILD** = conséquence des quatre précédents

> **Pourquoi un cluster ML séparé, plutôt que rattaché à AI ou à DATA (arbitrage A-10) :** Churn Prediction est du machine learning classique — classification supervisée, sans LLM ni agentique — et n'a explicitement aucune arête vers AI (§04.4.05). Le rattacher à AI aurait été une arête inventée, contraire à la règle §04.3. Le rattacher à DATA aurait implicitement raconté « le ML est une sous-compétence de la donnée », alors que le profil distingue *comprendre/structurer la donnée* (DATA), *apprendre/prédire* (ML) et *raisonner/générer/décider* (AI). Le contenu du cluster ML n'est pas préempli de technologies inventées : il sera dérivé des projets réels (XGBoost, LightGBM, classification supervisée — depuis §04.4.05), exactement comme les trois autres clusters.
> **Ce que ce changement ne change pas :** AI reste le centre de gravité et le plus gros cluster, cohérent avec le positionnement AI-first du §01.

**Contenu des clusters :**

```
AI              LLM · Generative AI · NLP · Agents · MCP · AI Prototyping
ML              Machine Learning · Supervised Learning · Predictive Modeling
AUTOMATION      APIs · Scraping · Pipelines · Agents · Scheduled workflows · Integrations
DATA            SQL · ETL · Data Modeling · Snowflake · Analytics · Visualization · Statistics
```

## 04.3 Règle de dérivation — `VALIDÉ`

> **Les relations du graphe sont dérivées des projets réels, jamais inventées.**
> **L'auto-évaluation sert uniquement à pondérer visuellement les nœuds. Elle ne crée aucune arête.**
> **Cette règle s'applique identiquement aux nœuds `experience` et aux nœuds `experiment`** :
> toute arête `experience → pillar` ou `experience → capability` doit être dérivée de sa
> propre grille §04.4, exactement comme pour une expérimentation du laboratoire — jamais
> d'arête ajoutée « par cohérence supposée » avec le rôle professionnel qui l'entoure.

Auto-évaluation fournie, **strictement interne, jamais affichée** :

| Compétence | Niveau | Compétence | Niveau |
|---|---|---|---|
| Python | 4.5 | Agentic AI | 4.5 |
| Power BI | 4.5 | Automation | 4 |
| IA / LLM | 4 | ML | 3.5 |
| SQL | 3 | Data Engineering | 3 |

Le niveau se traduit par **taille du nœud · densité · nombre de connexions · profondeur**. Jamais par un pourcentage affiché.

## 04.4 Grille d'extraction par projet — `À REMPLIR`

**⚠️ Grille interne. Ce n'est pas une structure de page.** La structure de page reste celle du §09.2, en six sections. Cette grille sert uniquement à extraire les nœuds et les arêtes du graphe.

Pour chaque expérimentation, renseigner :

```
FRICTION        La friction d'origine, en une phrase        → attribut du nœud projet
SYSTÈME         Ce qui a été construit                      → nature du nœud
AI              Briques IA générative/agentique mobilisées  → arêtes vers le cluster AI
ML              Briques ML/prédictif mobilisées              → arêtes vers le cluster ML
AUTOMATION      Briques d'automatisation                    → arêtes vers le cluster AUTOMATION
DATA            Sources, volumes, modélisation              → arêtes vers le cluster DATA
TECHNOLOGIES    Stack précise                               → nœuds capability + poids
RÉSULTAT        Le chiffre ou le fait qui prouve            → métrique affichée
PREUVE          Démo, dépôt, capture, case study            → niveau de preuve
```

### 04.4.01 — Job Agent — `REMPLI`

```
FRICTION        La recherche d'emploi manuelle (scanner plusieurs sites, lire chaque
                offre, juger sa pertinence, adapter l'angle de candidature) ne scale
                pas sur plusieurs zones géographiques cherchées en parallèle.
SYSTÈME         Pipeline multi-agents : scraping → RAG sur le profil candidat →
                agent de scoring (géographie déterministe + matching sémantique par
                atome + arbitrage LLM) → agent de génération d'analyse → API +
                dashboard de tri manuel. Orchestrateur qui prend de vraies décisions
                (re-scraping ciblé, statut incertain, gestion d'échec) plutôt que
                d'enchaîner les étapes sans condition.
AI              RAG "à la main" (pas de LangChain) : embeddings multilingues locaux
                (sentence-transformers), indexation vectorielle ChromaDB, recherche
                par atome avec seuil de bruit calculé dynamiquement. Agents LLM
                (API Mistral) pour l'extraction d'exigences, le scoring et la
                génération d'analyse structurée.
AUTOMATION      Scraping programmé (GitHub Actions, cron quotidien), pipeline de
                bout en bout sans intervention manuelle jusqu'à l'analyse, nettoyage
                automatique des offres obsolètes, persistance par commit CI.
                Garde-fou non négociable : aucune soumission automatique de
                candidature, la validation humaine reste le seul chemin vers une
                action externe.
DATA            107 offres scorées (73 Hellowork, 34 jobup.ch), schéma SQLite avec
                migrations explicites, 3 niveaux de trace JSON par offre pour audit
                complet a posteriori.
TECHNOLOGIES    Python 3.11 · Playwright · SQLite · ChromaDB · sentence-transformers ·
                API Mistral · FastAPI · Docker · GitHub Actions · Render.com
RÉSULTAT        Pipeline entièrement tracé et honnête par construction (jamais de
                fabrication de compétence, gap signalé explicitement plutôt que
                masqué) ; la granularité atomique du RAG détecte des gaps qu'une
                recherche composite manque silencieusement (cas réel vérifié).
PREUVE          live-demo (job-agent-otyo.onrender.com) + repo public
                (github.com/Ayreon69/job-agent)
```

### 04.4.03 — Commission Bot — `REMPLI` (proof niveau confidentiel — voir note)

```
FRICTION        Comprendre et calculer les commissions d'assurance (précompte,
                linéaire) demande de naviguer un script métier complexe et un
                fichier de paramétrage Excel — expertise concentrée chez peu de
                personnes, difficile à transmettre.
SYSTÈME         Assistant conversationnel qui explique les règles sans jamais
                calculer lui-même : injection du contexte complet (code + Excel)
                dans le system prompt, anonymisation systématique des noms
                internes avant tout appel API.
AI              System prompt complet (pas de RAG, contexte ~22k tokens < 128k) ·
                agent conversationnel API Mistral, temperature basse (0.3) pour
                des réponses factuelles.
AUTOMATION      Retry à backoff sur rate limit, anonymisation automatique par
                remplacement de texte (dictionnaire trié par longueur décroissante
                pour éviter les collisions de noms).
DATA            ~22 000 tokens de base de connaissance (script Python métier +
                paramétrage Excel converti en Markdown). Aucune base de données —
                le contexte est reconstruit à chaque démarrage depuis les fichiers
                sources.
TECHNOLOGIES    Python · Gradio · API Mistral · pandas
RÉSULTAT        Base de connaissance complète servie de façon honnête (le bot cite
                le code, n'invente jamais une règle) ; projet fonctionnel mais à
                retravailler avant mise en avant complète.
PREUVE          case-study anonymisée uniquement. Le dépôt GitHub reste privé :
                Documentation/*.py et *.xlsx contiennent les vrais noms de
                périmètres/produits d'assurance de l'employeur, non anonymisés à
                la source — seul ce qui part vers le LLM l'est.
```

### 04.4.04 — AI Watch — `REMPLI`

```
FRICTION        Suivre l'actualité IA en continu sur ~34 sources pour rester à jour
                (agentic coding, Claude Code, automatisation, migration SAS→Python)
                ne scale pas manuellement : l'essentiel se noie dans le bruit.
SYSTÈME         Collecteur autonome (GitHub Actions, aucun PC allumé requis) qui
                agrège les flux, score chaque item selon un profil de pertinence
                personnel, publie un digest quotidien + hebdomadaire, et génère une
                seconde version publique expurgée du même générateur.
AI              Scoring de pertinence par LLM selon un profil (API Gemini, tier
                gratuit) · développement d'article à la demande à partir du contenu
                réel de la page, pas du seul titre.
AUTOMATION      Cron GitHub Actions (digest quotidien 05:00 UTC, hebdo lundi
                06:00 UTC) · sync locale périodique · pipeline de scoring et
                désactivation de sources pilotée par le rendement mesuré, pas le
                volume.
DATA            15 733 fiches en base, ~34 sources RSS/scraping ciblé, arbitrage
                measuré source par source (ex. Claude Code releases 100 % de
                rendement vs Next.ink 7 %) — 7 sources désactivées sur cette base.
TECHNOLOGIES    Python · GitHub Actions · API Gemini · feedparser / httpx ·
                Cloudflare Pages + Worker · Obsidian
RÉSULTAT        Système opérationnel dans le cloud, 23 sources actives sur 34 ;
                architecture privacy-first sur la version publique — la clé API du
                lecteur ne quitte jamais son navigateur, aucune donnée collectée.
PREUVE          live-demo (veille-ia.pages.dev). Dépôt source volontairement privé
                (c'est le vault Obsidian personnel complet, pas seulement ce projet).
```

### 04.4.06 — Expérience : Automatisation des commissions — `REMPLI` (nœud `experience`)

```
FRICTION        Seul expert de l'entreprise sur les règles de commissionnement
                (mode, règles, taux) — toute question, de n'importe qui, passait
                par lui, consommant du temps des deux côtés en continu.
SYSTÈME         Le même système que Commission Bot (§04.4.03), construit et utilisé
                en conditions réelles dans l'entreprise pour éliminer ces échanges
                répétitifs — la version « professionnelle » du même système que sa
                version « laboratoire ».
AI              Identique à Commission Bot : system prompt complet injectant le
                code métier et le paramétrage, agent conversationnel API Mistral.
ML              Aucune.
AUTOMATION      Suppression des allers-retours humains pour une question à réponse
                déterministe mais dispersée dans du code et de l'Excel.
DATA            Identique à Commission Bot : script Python métier + paramétrage
                Excel, anonymisés avant tout appel API.
TECHNOLOGIES    Python · Gradio · API Mistral · pandas
RÉSULTAT        Une réponse immédiate à une question sur le commissionnement, sans
                passer par Rayan. Le système explique les règles réelles et ne calcule
                jamais : il ne peut donc pas inventer un montant.
                ⚠ Retiré le 2026-09-09 : « +70 % de vitesse de réponse, erreurs quasi
                nulles ». Aucune instrumentation n'existait avant ni après — le chiffre
                était une estimation, pas une mesure. Cette expérience n'a donc PAS de
                métrique affichée, et l'asymétrie avec la migration SAS (50 000 €/an,
                chiffre réel) est une information, pas un manque à combler.
PREUVE          case-study uniquement — aucun code montré (cohérent avec Commission
                Bot, §04.4.03 : dépôt privé, données employeur non anonymisées à la
                source).
```

### 04.4.07 — Expérience : Migration SAS → Python — `REMPLI` (nœud `experience`)

```
FRICTION        Une trentaine de programmes de production tournaient sous SAS —
                coût de licence pour toute l'équipe, lenteur et fiabilité en retrait
                par rapport à une alternative moderne.
SYSTÈME         Migration de ces programmes vers Python, sur la préconisation de
                Rayan — décision stratégique autant que travail d'exécution.
                Reprendre et recoder chaque programme à la main aurait pris des
                MOIS : la migration a été menée par un système d'agents, cadré
                par des règles spécifiques pour qu'aucun programme ne régresse.
AI              Système d'agents de migration : lecture des programmes SAS,
                traduction en Python, puis analyse comparée des sorties pour
                garantir l'absence de régression. Les agents ne traduisent pas
                seulement — ils contrôlent leur propre résultat contre
                l'original, sous des règles écrites pour ça. Corrigé le
                2026-09-07 : cette grille portait « AI — Aucune. », ce qui a
                privé le graphe de trois arêtes réelles (`pillar-ai` feeds 2,
                `llm` uses 3, `agentic-ai` uses 3).
ML              Aucune.
AUTOMATION      Remplacement d'un outil propriétaire par une stack scriptable et
                automatisable, sur une trentaine de programmes de production.
DATA            Programmes de traitement de données de production (contexte
                actuariel/assurance ECA) — volume et nature précise non détaillés
                à ce stade.
TECHNOLOGIES    SAS → Python (stack Python précise non détaillée à ce stade)
RÉSULTAT        Économie de plus de 50 000 €/an sur les licences SAS de l'équipe,
                fiabilité et rapidité accrues des programmes migrés. Migration
                menée en DEUX SEMAINES là où un recodage manuel programme par
                programme aurait pris des mois — sans régression.
PREUVE          case-study uniquement — aucun code montré.
```

### 04.4.05 — Churn Prediction — `RECONSTRUIT` (implémentation originale perdue)

```
FRICTION        Chez ECA Assurances, un fort volume de signatures clients masquait
                un problème structurel : plus de 50 % des clients résiliaient avant
                leur première année, sans signal d'alerte précoce.
SYSTÈME         Pipeline de classification supervisée pour anticiper le risque de
                résiliation : EDA → pipeline data → feature engineering →
                comparaison de plusieurs modèles → gradient boosting retenu.
AI              Aucune brique LLM/agentique. Pas d'arête vers le cluster AI.
ML              Classification supervisée, comparaison de plusieurs familles de
                modèles, gradient boosting retenu (XGBoost/LightGBM). Arête forte
                vers le cluster ML — c'est le seul projet du laboratoire qui y
                connecte à ce jour.
AUTOMATION      Pas d'automatisation de bout en bout documentée (projet analytique
                ponctuel, pas un système qui tourne en continu).
DATA            Historique clients ECA Assurances, feature engineering manuel,
                comparaison de plusieurs familles de modèles avant sélection finale.
TECHNOLOGIES    Python · XGBoost / LightGBM · pandas
RÉSULTAT        Recall de 85% sur la classe résiliation — priorité donnée à limiter
                les faux négatifs (clients à risque non détectés).
PREUVE          case-study, reconstruction méthodologique honnête — l'implémentation
                originale est perdue, aucun code ni capture d'écran d'origine
                disponible. Le contenu de la page projet doit l'annoncer
                explicitement plutôt que suggérer une preuve qui n'existe pas.
```

### 04.4.02 — ARAM Stats — `REMPLI`

```
FRICTION        Riot bloque volontairement l'accès aux données de la file ARAM : Mayhem
                (match-v5 renvoie 403 sur la queue 2400) : impossible de savoir quels
                champions, augments et objets dominent réellement ce mode.
SYSTÈME         Crawler en boule de neige (snowball) sur l'API locale du client League
                (LCU), pipeline de collecte → SQLite → deux interfaces de restitution
                (explorateur local + site public au filtrage 100 % navigateur).
AI              Aucune brique IA — pas d'arête vers le cluster AI.
AUTOMATION      Crawl continu et résilient (reprise sur interruption), garde-fous
                mémoire automatiques (seuils RAM déclenchant un allègement du client
                League), détection automatique du dernier patch en cours.
DATA            150 140 parties, 1,5 M lignes joueur, base SQLite 2,0 Go, WAL.
                Modélisation : tables dénormalisées (picks/items/participants) pour
                éviter les jointures à l'agrégation ; pipeline d'agrégats précalculés
                (agg_*) ; export binaire compact (dictionnaire, tri, colonne-majeur)
                pour calcul côté navigateur.
TECHNOLOGIES    Python 3.11 · SQLite (WAL) · requests / ThreadPoolExecutor · numpy ·
                Pillow · psutil / ctypes · JS vanilla · TypedArray / ArrayBuffer ·
                DecompressionStream · Cloudflare Pages
RÉSULTAT        1,5 M de lignes filtrées et agrégées en 11 à 37 ms dans le navigateur,
                sans backend.
PREUVE          live-demo — mayhem-7wz.pages.dev
```

## 04.5 Schéma de données cible

```ts
type NodeType = 'pillar' | 'output' | 'experiment' | 'experience' | 'capability' | 'domain'

type Node = {
  id: string
  slug: string                                // route /laboratoire/[slug]
  label: string
  type: NodeType
  cluster: 'ai' | 'ml' | 'automation' | 'data' // centre de gravité du nœud, PAS la liste
                                                // exhaustive de ses relations (un experiment
                                                // peut avoir des arêtes vers plusieurs pillars
                                                // tout en n'ayant qu'un seul `cluster`) — BUILD
                                                // est un 'output', pas un cluster
  weightInputs?: { selfLevel: number }        // interne, jamais rendu
  year: number
  status: 'live' | 'wip' | 'archived' | 'lost'
  friction: string
  metric?: { value: string; label: string }
  treatment: 'editorial' | 'dataviz' | 'webgl'
  mobileTreatment: 'editorial' | 'dataviz-2d' | 'static'
  proofLevel: 'live-demo' | 'video' | 'screens' | 'case-study'
  anonymized: boolean
  accent?: string
  universe?: string
  links?: { repo?: string; live?: string }
  fr: {...}                                   // langue de référence
  en?: {...}                                  // optionnel, phase 2
}

type Edge = {
  from: string
  to: string
  kind: 'uses' | 'feeds' | 'proves' | 'produces'
  weight: number   // 1–3, dérivé des projets
}
```

## 04.6 Évolution du système à travers le site — `VALIDÉ`

Le système data n'est **jamais une animation indépendante**. C'est **un même système qui change d'état**.

| Section | Comportement |
|---|---|
| HERO | Le système fonctionne, on l'observe |
| PHILOSOPHIE | Les connexions se simplifient, la boucle apparaît |
| PROFIL | Le système fait apparaître le profil et les compétences |
| LABORATOIRE | Certains nœuds deviennent des projets |
| PARCOURS | Les connexions montrent comment les expériences ont construit les compétences |

> Message implicite : **« Ses projets sont la matérialisation de ses compétences. »**

## 04.7 Graphe dérivé (v1) — `DATA MODEL VALIDÉ` / rendu visuel `VALIDÉ` le 2026-09-05

> **Distinction importante :** ce qui suit fige le **modèle de données** (nœuds, arêtes,
> poids — `data/nodes.json` et `data/edges.json`). Le **rendu visuel** a été testé
> séparément et validé le 2026-09-05 — voir §04.8.

### Dataset source ≠ graphe narratif — `VALIDÉ` (D-14)

| | Nœuds | Arêtes | Rôle |
|---|---|---|---|
| **Dataset source** | 29 | 60 | `data/nodes.json` + `data/edges.json`. Reste complet, ne change pas. |
| **Graphe narratif** | **27** | **53** | Ce qui est réellement affiché. Dérivé par calcul, jamais par une liste codée en dur. |

Deux retraits, deux raisons distinctes :

- **`build` — sortie tautologique.** Les 7 projets/expériences lui envoient un `produces`
  de poids 1, sans exception. L'arête ne dit rien d'autre que « ce projet construit
  quelque chose » : couche sémantique redondante qui tirait tout vers le barycentre sans
  rien distinguer. Retrait mesuré au prototype : −2 nœuds / −7 arêtes, **aucune perte
  d'information**, et le cœur du graphe redevient lisible. `BUILD` **reste un concept
  éditorial du site** (la boucle `FRICTION → COMPRENDRE → CONSTRUIRE → AUTOMATISER →
  ITÉRER`) — la séparation entre philosophie du portfolio et données du Data DNA est
  volontaire.
- **Nœuds sans aucune arête** (aujourd'hui `power-bi`). Aucune grille §04.4 ne les
  supporte. Power BI reste dans le profil, le CV et les expériences — il n'a simplement
  aucune relation à montrer ici. **Le visiteur n'a aucune raison d'apprendre qu'un nœud a
  été retiré** : le Data DNA raconte le profil, pas les décisions de construction du Data
  DNA. Aucune mention « hors système » dans l'interface finale.

Le retrait est **calculé** (`deriveNarrativeGraph`, `prototype-persistance-canvas/lib/graph-layout.ts`)
et non codé en dur : si une grille §04.4 future crée une arête vers `power-bi`, il rentre
automatiquement dans le graphe narratif.

> Cette distinction prolonge exactement la règle déjà actée plus bas : *tout ce qui existe
> dans les données n'a pas nécessairement sa place dans ce qui est montré.*

Première dérivation complète à partir des 5 grilles d'expérimentation (§04.4.01–05) et
des 2 grilles d'expérience (§04.4.06–07). Granularité `capability` : intermédiaire
(arbitrage pris le 2026-09-05) — les 8 compétences auto-évaluées du §04.3, plus les
technologies nommées et reconnaissables par un recruteur technique. Les bibliothèques
utilitaires incidentes (`psutil`, `ctypes`, `Pillow`, `numpy`, `requests`...) ne
deviennent pas des nœuds ; elles restent mentionnées dans le texte des pages projet.

**Rappel de la règle (§04.3) :** l'auto-évaluation ne fixe que la **taille** des nœuds
`capability` (`weightInputs.selfLevel`) — chaque **arête** ci-dessous est tracée depuis
un fait concret présent dans une grille §04.4, jamais depuis le tableau d'auto-évaluation
seul.

### Nœuds `pillar` et `output`

| id | label | type |
|---|---|---|
| `pillar-ai` | AI | `pillar` |
| `pillar-ml` | ML | `pillar` |
| `pillar-automation` | AUTOMATION | `pillar` |
| `pillar-data` | DATA | `pillar` |
| `build` | BUILD | `output` |

### Nœuds `experiment` (laboratoire)

| id | slug | label | status | proofLevel |
|---|---|---|---|---|
| `job-agent` | `job-agent` | Job Agent | `live` | `live-demo` |
| `aram-stats` | `aram-stats` | ARAM Stats | `live` | `live-demo` |
| `commission-bot` | `commission-bot` | Commission Bot | `live` (privé) | `case-study` |
| `ai-watch` | `ai-watch` | AI Watch | `live` | `live-demo` |
| `churn-prediction` | `churn-prediction` | Churn Prediction | `lost` | `case-study` |

### Nœuds `experience` (parcours)

| id | label | status | proofLevel |
|---|---|---|---|
| `exp-commissions` | Automatisation des commissions (ECA Assurances) | `live` (interne) | `case-study` |
| `exp-sas-python` | Migration SAS → Python (ECA Assurances) | `archived` | `case-study` |

### Nœuds `capability`

Classés par le principe du 2026-09-05 : **le Data DNA ne représente pas tout ce
que Rayan sait utiliser — il représente les relations qui expliquent comment il
construit.** Trois niveaux, du plus au moins structurant :

**Structurant** — les 8 compétences auto-évaluées (§04.3), colonne vertébrale du
profil :

| id | label | cluster | selfLevel |
|---|---|---|---|
| `python` | Python | `automation` | 4.5 |
| `sql` | SQL | `data` | 3 |
| `power-bi` | Power BI | `data` | 4.5 |
| `ia-llm` | IA / LLM | `ai` | 4 |
| `agentic-ai` | Agentic AI | `ai` | 4.5 |
| `automation-skill` | Automation | `automation` | 4 |
| `ml-skill` | Machine Learning | `ml` | 3.5 |
| `data-engineering` | Data Engineering | `data` | 3 |

**Distinctif** — technologies nommées dont la présence, même isolée, porte un
vrai signal (choix architectural, pas détail d'infra) :

| id | label | cluster |
|---|---|---|
| `chromadb` | ChromaDB | `ai` |
| `sentence-transformers` | sentence-transformers | `ai` |
| `api-mistral` | API Mistral | `ai` |
| `api-gemini` | API Gemini | `ai` |
| `playwright` | Playwright | `automation` |
| `github-actions` | GitHub Actions | `automation` |
| `sqlite` | SQLite | `data` |
| `xgboost-lightgbm` | XGBoost / LightGBM | `ml` |
| `sas` | SAS | `data` |

**Retiré du graphe (« incidentel »)** — `docker`, `render`, `fastapi` (audit du
2026-09-05), puis `pandas`, `gradio`, `cloudflare-pages` (deuxième passe, review
externe du même jour) : des dépendances réelles mais qui n'expliquent aucune
relation entre projets, plutôt un `requirements.txt` visualisé. Elles restent
mentionnées en texte dans la page du projet concerné — rien n'est caché.
**17 nœuds `capability` au total** (8 structurants + 9 distinctifs).

> **`power-bi` a zéro arête entrante** — observation, pas une erreur : aucune des 5
> expérimentations ni des 2 expériences ne l'utilise (Power BI a été retiré du
> laboratoire, arbitrage A-09). Le nœud existe pour représenter le niveau de
> compétence, isolé dans le graphe. Cohérent avec le positionnement §01 (Data
> Engineer/Analytics = présent, non mis en avant).

### Arêtes vers les clusters (`pillar`), toutes `kind: 'feeds'`

| from | to | weight | justification (grille source) |
|---|---|---|---|
| `job-agent` | `pillar-ai` | 3 | RAG maison + agents LLM, cœur du système |
| `job-agent` | `pillar-automation` | 3 | cron, pipeline bout en bout, garde-fous |
| `job-agent` | `pillar-data` | 2 | schéma SQLite, 107 offres, 3 traces/offre |
| `aram-stats` | `pillar-automation` | 2 | crawl résilient, garde-fous mémoire auto |
| `aram-stats` | `pillar-data` | 3 | 150 140 parties, 2,0 Go, encodage binaire |
| `commission-bot` | `pillar-ai` | 2 | system prompt complet, agent conversationnel |
| `commission-bot` | `pillar-automation` | 1 | retry/backoff, anonymisation automatique |
| `commission-bot` | `pillar-data` | 1 | ~22k tokens contexte, pas de base de données |
| `ai-watch` | `pillar-ai` | 2 | scoring LLM par profil, développement à la demande |
| `ai-watch` | `pillar-automation` | 3 | cron quotidien/hebdo, pipeline autonome cloud |
| `ai-watch` | `pillar-data` | 3 | 15 733 fiches, 34 sources, arbitrage par rendement |
| `churn-prediction` | `pillar-ml` | 3 | seul projet connecté à ML — classification supervisée |
| `churn-prediction` | `pillar-data` | 2 | historique clients, feature engineering |
| `exp-commissions` | `pillar-ai` | 2 | même système que Commission Bot |
| `exp-commissions` | `pillar-automation` | 1 | suppression des allers-retours humains |
| `exp-sas-python` | `pillar-automation` | 2 | migration de ~30 programmes de production |
| `exp-sas-python` | `pillar-data` | 2 | programmes de traitement de données de production |

*(`churn-prediction` et `exp-sas-python`/`exp-commissions` n'ont **aucune** arête vers
`pillar-ai` ou `pillar-ml` au-delà de celles listées — absence documentée dans les
grilles source, pas un oubli.)*

### Arêtes vers les compétences (`capability`), toutes `kind: 'uses'`

| from | to | weight |
|---|---|---|
| `job-agent` | `python` | 3 |
| `job-agent` | `playwright` | 2 |
| `job-agent` | `sqlite` | 2 |
| `job-agent` | `sql` | 2 |
| `job-agent` | `chromadb` | 3 |
| `job-agent` | `sentence-transformers` | 2 |
| `job-agent` | `api-mistral` | 3 |
| `job-agent` | `github-actions` | 2 |
| `job-agent` | `agentic-ai` | 3 |
| `job-agent` | `ia-llm` | 3 |
| `job-agent` | `automation-skill` | 3 |
| `job-agent` | `data-engineering` | 2 |
| `aram-stats` | `python` | 3 |
| `aram-stats` | `sqlite` | 3 |
| `aram-stats` | `sql` | 2 |
| `aram-stats` | `automation-skill` | 2 |
| `aram-stats` | `data-engineering` | 3 |
| `commission-bot` | `python` | 3 |
| `commission-bot` | `api-mistral` | 3 |
| `commission-bot` | `ia-llm` | 2 |
| `ai-watch` | `python` | 3 |
| `ai-watch` | `github-actions` | 2 |
| `ai-watch` | `api-gemini` | 3 |
| `ai-watch` | `ia-llm` | 2 |
| `ai-watch` | `automation-skill` | 3 |
| `ai-watch` | `data-engineering` | 2 |
| `churn-prediction` | `python` | 3 |
| `churn-prediction` | `xgboost-lightgbm` | 3 |
| `churn-prediction` | `ml-skill` | 3 |
| `exp-commissions` | `python` | 3 |
| `exp-commissions` | `api-mistral` | 3 |
| `exp-commissions` | `ia-llm` | 2 |
| `exp-sas-python` | `python` | 3 |
| `exp-sas-python` | `sas` | 3 |
| `exp-sas-python` | `automation-skill` | 2 |
| `exp-sas-python` | `data-engineering` | 2 |

### Arêtes `produces` (expérimentation/expérience → BUILD)

Chaque nœud `experiment` et `experience` porte une arête `produces` vers `build`,
poids 1 (uniforme — BUILD est la sortie du système, pas un point à pondérer par projet) :
les 5 expérimentations + les 2 expériences → `build`.

### Ce que ce graphe raconte déjà

- **AI reste le centre de gravité** : 4 des 7 nœuds projet/expérience s'y connectent
  (job-agent, commission-bot, ai-watch, exp-commissions), avec le poids le plus fort
  sur Job Agent (3/3 sur AI et AUTOMATION à la fois).
- **ML est un cluster fin mais réel** : une seule arête forte (churn-prediction), ce qui
  est honnête plutôt que gonflé artificiellement.
- **AUTOMATION traverse tout**, comme annoncé dans l'arbitrage A-10 — présent à des
  degrés divers dans 6 nœuds sur 7 (absent seulement de churn-prediction).
- **`power-bi` isolé** confirme visuellement l'arbitrage A-09 : présent dans le profil,
  absent de la pratique montrée.
- **Le graphe raconte `Rayan → AI/ML/AUTOMATION/DATA → projets → technologies
  significatives`, pas `Rayan → Job Agent → Python → ... → tout ce qui a servi`.**
  C'est la différence entre une manière de construire et un `requirements.txt`
  visualisé — voir la règle ci-dessous.

> **Règle forte actée le 2026-09-05 (review externe) : le Data DNA ne représente
> pas tout ce que Rayan sait utiliser. Il représente les relations qui expliquent
> comment Rayan construit.** Corollaire pratique : une technologie qui n'a qu'une
> seule connexion et n'explique rien du raisonnement (choix d'infra incident plutôt
> que décision architecturale) sort du graphe et reste en texte dans la page projet.
> Ce n'est pas la même question que « aucune arête inventée » (§04.3) — celle-ci
> porte sur la *véracité* d'une arête, celle-ci porte sur son *intérêt narratif*.
> Les deux se cumulent : une arête doit être à la fois réelle et significative pour
> mériter un nœud dans le graphe principal.

> **Statut :** figé en fichiers de données le 2026-09-05, audité en deux passes le
> même jour (retrait initial de `docker`/`render`/`fastapi`, puis de
> `pandas`/`gradio`/`cloudflare-pages` après review externe) —
> [`data/nodes.json`](data/nodes.json) (29 nœuds) et [`data/edges.json`](data/edges.json)
> (60 arêtes), validés référentiellement (aucune arête ne pointe vers un id inexistant).
> Convention : les champs non applicables à
> un type de nœud (`friction`, `treatment`, `metric`... sur les nœuds `pillar`/`output`/
> `capability`) valent `null` plutôt qu'une valeur inventée. Les six sections `fr.*` de
> page projet (§09.2) ne sont remplies qu'en partie (`title`/`subtitle`/`friction`/
> `system`/`result`) — `construction`/`donnees`/`recul` restent `null`, la rédaction
> complète des pages est un travail de copywriting distinct, pas encore fait.

---

## 04.8 Prototype visuel du Data DNA — `VALIDÉ` le 2026-09-05

Implémentation : [`prototype-persistance-canvas/app/data-dna/page.tsx`](prototype-persistance-canvas/app/data-dna/page.tsx)
+ [`lib/graph-layout.ts`](prototype-persistance-canvas/lib/graph-layout.ts) (`/data-dna`).
Rendu 2D SVG, distinct du halo 3D du Hero — **mêmes données, deux niveaux de lecture** :
Hero = atmosphère / présence / signature ; page = information / structure / exploration.

### Protocole — ce qui rend le résultat exploitable

Les 27 positions sortent d'une **simulation de forces déterministe** qui ne connaît que
les 53 arêtes. Les 4 piliers ne sont **pas** ancrés en croix comme dans le Hero : les
ancrer aurait garanti un « oui » à la question 4 ci-dessous. *Une question dont on truque
la réponse ne sert à rien.* Aucune position n'est choisie à la main, aucun `Math.random()`
(graine dérivée de l'id, composition identique à chaque chargement).

### Résultat du test des 5 questions

| # | Question | Réponse du graphe |
|---|---|---|
| 1 | Où est le centre de gravité ? | **`Python`** — seule compétence reliée aux 7 projets *et* expériences, sans exception (poids cumulé 21). Pas « AI ». Côté projets : **`Job Agent`**, 15 relations / poids 38, soit +58 % sur le suivant. |
| 2 | Quels sont les projets ? | **Oui** — 5 disques + 2 losanges, taille dérivée du poids réel. |
| 3 | Quelles compétences les relient ? | **Partiellement en statique** (on voit *qu'il y a* un socle partagé), **totalement au niveau C**. |
| 4 | Les 4 piliers apparaissent-ils naturellement ? | **Non — et c'est le résultat le plus intéressant.** `AI` + `DATA` + `AUTOMATION` se superposent au barycentre (chaque projet en alimente 2 ou 3). Seul `ML` se détache, parce qu'il est périphérique : 1 projet (2023, `lost`), 1 compétence, 1 librairie. |
| 5 | Comprend-on plus qu'avec une liste ? | **Oui, mais conditionné à l'interaction.** A : non. B : faiblement. C : nettement. |

### Décisions actées

- **L'asymétrie se conserve, elle ne se corrige pas.** Le profil n'est pas organisé autour
  de quatre technologies indépendantes : c'est un **noyau Data / Python / Automation / AI
  fortement interconnecté, avec un axe ML plus spécialisé**. Pour un recruteur technique
  c'est plus mémorable qu'un graphe parfaitement équilibré.
- **`ML` reste dans les données et dans le graphe**, sans qu'on lui fabrique un territoire
  de même poids que les trois autres. Son rayon (dérivé du poids cumulé) le rend déjà
  visiblement plus petit et périphérique — **aucun texte interprétatif ajouté** ; au clic,
  le visiteur découvre `Churn Prediction → Machine Learning → XGBoost / LightGBM` et
  conclut lui-même.
- **Pas de calque « territoires de cluster ».** Il dessinait quatre enveloppes de même
  traitement et invitait donc à chercher quatre zones comparables — exactement la
  manipulation que le protocole cherche à éviter. L'instrument a répondu à la question 4,
  il est retiré.
- **A n'a pas à être aussi lisible que C** — ce serait une mauvaise optimisation. Rôle de
  A : *voilà la structure réelle*. Rôle de C : *voilà comment la lire*.
- **Conséquence d'architecture :** la page Data DNA **ne peut pas être une image**, et le
  fallback sans JS doit être une **liste structurée réelle**, pas une capture du graphe.

### Niveau C — sémantique d'arête

À la sélection, les arêtes incidentes encodent leur `kind` : `feeds` en trait plein,
`uses` en pointillé. Le panneau groupe les relations par (`kind`, sens) —
`ALIMENTE` / `UTILISE` / `ALIMENTÉ PAR` / `UTILISÉ PAR` — avec le poids réel (1–3) rendu
tel quel.

> **Limite assumée, vérifiée dans les données :** une nuance plus fine du type
> « *utilisé dans* » vs « *structure* » **n'existe pas** dans `edges.json`.
> `job-agent → python` et `job-agent → agentic-ai` sont la **même arête** (`uses`,
> poids 3). Elle n'a donc pas été inventée (§04.3). Les quatre intitulés ci-dessus sont la
> traduction littérale de ce que le fichier contient, rien de plus.

### Point ouvert (non bloquant)

Le panneau de détail se superpose au coin haut-droit du graphe et masque la branche `ML`
quand un nœud est épinglé (les nœuds masqués sont alors atténués de toute façon). À
arbitrer lors de l'intégration réelle de la page, pas avant.

---

# 05 — UX & PARCOURS RECRUTEUR — `VALIDÉ`

## 05.1 Principes

> **L'expérience te guide. L'interface ne te contrôle jamais.**
> **Scroll = scroll. Bouton = bouton. Menu = menu. Retour = retour.**
> **Simple en surface, riche en profondeur.**

**Deux niveaux d'accès :**
1. **Parcours naturel** — `HERO → PHILOSOPHIE → PROFIL → LABORATOIRE → PARCOURS → CV → CONTACT`
2. **Navigation directe** — menu toujours accessible + nœuds cliquables dans le système

**Deux modes du système :**

| Mode | Comportement |
|---|---|
| **NARRATIF** | Le scroll pilote le système. Les projets apparaissent progressivement dans le réseau. |
| **EXPLORATION** | Clic sur un nœud → le système arrête son animation narrative et laisse explorer librement. Le retour ramène proprement. |

**Interdits :** navigation imposée en 3D · scroll à travers des espaces 3D vides · énigme pour ouvrir un projet · caméra qui traverse du vide · audio. **Aucune animation ne doit empêcher de lire ou de cliquer.**

## 05.2 Les trois profils de visiteur — `VALIDÉ`

Trois intentions, **un seul site**. Pas trois parcours construits séparément : trois lectures possibles de la même structure.

### Profil 1 — Le recruteur pressé

**Intention :** qualifier le candidat vite.
**Chemin :** `Qui ? → Quoi ? → Expérience ? → CV`
**Contrainte :** doit aboutir en **moins de 30 secondes et ≤ 2 clics**.

Ce qu'il doit trouver sans effort :
- Le positionnement dans le hero, sans scroller
- Un accès CV visible depuis le menu, sur toutes les pages
- `PARCOURS` lisible en diagonale, sans interaction

> **Il ne doit jamais avoir à attendre une animation.** C'est le profil qui casse le site s'il est mal traité : il repart en 8 secondes.

### Profil 2 — Le recruteur intéressé

**Intention :** comprendre ce que le candidat produit.
**Chemin :** `Qui ? → Projets → Technologies → Résultats → CV`
**Contrainte :** chaque expérimentation compréhensible en **moins d'une minute**.

Ce qu'il doit trouver :
- La galerie `LABORATOIRE` immédiatement scannable
- Dans chaque page projet, `FRICTION → SYSTÈME → RÉSULTAT` lisible sans interagir
- Un chiffre concret par projet

### Profil 3 — Le profil technique ou le manager

**Intention :** évaluer la profondeur réelle.
**Chemin :** `Système → Architecture → Code → Démo → Recul`
**Contrainte :** la profondeur existe mais n'est **jamais imposée** aux profils 1 et 2.

Ce qu'il doit trouver :
- La visualisation interactive du système, derrière `EXPLORER LE SYSTÈME`
- La section `RECUL` — c'est elle qui distingue un exécutant d'un ingénieur
- Les liens dépôt / démo quand ils existent
- Le Data Profile filtrable par compétence

### Ce que cette grille impose

| Règle | Profil concerné |
|---|---|
| Le CV est atteignable depuis n'importe où en ≤ 2 clics | 1 |
| Aucune information essentielle n'est cachée derrière un hover ou une animation | 1, 2 |
| La profondeur est toujours derrière une action volontaire | 3 sans gêner 1 |
| Chaque page projet se lit en surface **et** en profondeur | 2 et 3 |
| Aucune URL n'est inatteignable directement | tous |

> **Test avant wireframes :** pour chaque écran, se demander lequel des trois profils il sert, et vérifier qu'il ne pénalise pas les deux autres.

---

# 06 — MOTION — `VALIDÉ`

> **L'INTERFACE EST PRÉCISE. LE SYSTÈME EST VIVANT.**

| | Comportement |
|---|---|
| **Interface** | Menu → apparition nette · Boutons → feedback précis · Textes → transitions maîtrisées · Navigation → toujours prévisible · Scroll → normal |
| **Système** | Particules → mouvement organique · Réseau → réorganisation dynamique · Données → flux continu · 3D → inertie / physique |

| Situation | Comportement |
|---|---|
| Aucun mouvement | Système très calme |
| Souris | Réaction subtile |
| Hover | Réaction locale |
| Scroll | Transformation progressive |
| Clic | Transition plus dynamique |
| Navigation | Transformation du système |
| Arrivée dans une section | Retour progressif au calme |

**Curseur contextuel** (desktop uniquement) :

| Contexte | Curseur |
|---|---|
| Repos / Hero | `●` |
| Survol d'un projet | `EXPLORER` |
| Survol d'une compétence | `INSPECTER` |
| Survol d'un bouton | `OUVRIR` |
| Visualisation interactive | `INTERAGIR` |

**Règles techniques :** n'animer que `transform` / `opacity` · respecter `prefers-reduced-motion` · une animation signature par section · lazy-load de toute lib > 40 Ko.

---

# 07 — ARCHITECTURE & ROUTING — `VALIDÉ`

**Décision : vraies routes.** Récit continu à l'accueil, URL propre par expérimentation.

```
/                          HERO · PHILOSOPHIE · PROFIL · LABORATOIRE (galerie) ·
                           PARCOURS · CV · CONTACT
/laboratoire/[slug]        Page dédiée par expérimentation
/cv                        (optionnel — sinon ancre sur /)
```

| Conséquence | Détail |
|---|---|
| URL partageable | Un recruteur reçoit directement `/laboratoire/job-agent` |
| SEO par projet | `metadata` et `opengraph-image` propres à chaque page |
| Bouton retour natif | L'historique du navigateur suffit |
| Bundle initial allégé | Chaque route charge son univers, pas les six |
| **Point dur** | Le Data System doit **survivre au changement de route** |

## 07.1 Risque technique n°1 — persistance du système — `VALIDÉ` (prototypé 2026-09-05)

Si le canvas est démonté puis remonté au changement de route, la promesse « un même système qui change d'état » s'effondre : il ne reste qu'une animation par page.

**Approche validée en prototype (D-07 résolu) :**
- Le canvas vit dans le **`layout.tsx` racine**, hors du segment de route → jamais démonté
- Les routes ne changent que le contenu DOM au-dessus du canvas
- Le système lit la route courante (`usePathname`) et **change d'état** au lieu de se recréer
- Transitions de page via View Transitions ou une couche `Motion` sur le contenu, jamais sur le canvas

> **Résultat du prototype :** `prototype-persistance-canvas/` (Next.js 16 App Router +
> React Three Fiber). Un `<PersistentScene>` (client component) rendu dans
> `app/layout.tsx`, avec un mesh Three.js et un overlay de preuve (timestamp de montage +
> route courante + compteur de frames). Deux routes (`/` et `/laboratoire`) reliées par
> `next/link`.
>
> **Test effectué :** relevé du timestamp de montage sur `/`, navigation client-side vers
> `/laboratoire` (couleur du mesh passe de bleu à orange, la route affichée se met à jour),
> puis retour vers `/`. **Le timestamp de montage est resté strictement identique aux deux
> allers-retours** — preuve directe que le composant n'a jamais été démonté. Confirmé par
> la doc officielle Next.js 16 consultée en amont : *"Layouts do not rerender on
> navigation"* mais *"Client Components re-render during navigation, they have access to
> the latest pathname"* — le mécanisme anticipé au §07.1 est exactement celui que Next.js
> fournit nativement, aucun contournement nécessaire.
>
> **Point de vigilance découvert (mineur, corrigé) :** un mismatch d'hydratation SSR/client
> est apparu quand le timestamp de montage était calculé pendant le rendu initial
> (`useState(() => new Date().toISOString())`, différent entre le rendu serveur et
> l'hydratation client). Corrigé en déplaçant l'initialisation dans un `useEffect`
> (client-only, après hydratation) — à retenir pour tout état basé sur l'horloge ou le
> hasard dans un composant persistant.
>
> **Non testé dans ce prototype :** le compteur de frames (`requestAnimationFrame` via
> `useFrame` de R3F) reste bloqué à 0 dans l'environnement de preview utilisé, celui-ci
> gardant `document.hidden = true` — la boucle de rendu elle-même tourne bien (le mesh
> tourne visiblement d'une capture à l'autre), seul le compteur textuel échantillonné
> n'a pas incrémenté à temps. Sans conséquence sur la conclusion : le timestamp de montage
> est une preuve suffisante et plus robuste (indépendante de rAF/visibilité).
>
> **Conclusion : le concept de continuité tient.** Le développement peut se baser sur cette
> mécanique sans réserve.

## 07.2 Langue — `VALIDÉ`

**Français en langue de référence. L'anglais est secondaire et hors périmètre v1.**

**Renommage imposé par le français** (`EXPERIMENTS` et `EXPERIENCE` se traduisent tous deux par « expériences ») :

| Anglais | Français v1 |
|---|---|
| `EXPERIMENTS` | **`LABORATOIRE`** |
| `EXPERIENCE` | **`PARCOURS`** |
| Une entrée du laboratoire | **`EXPÉRIMENTATION 01`** |

**Quatre règles :**
1. **Contenu rédactionnel** : français. Tout ce qui est une phrase.
2. **Labels de structure** : français. `FRICTION · CONSTRUCTION · SYSTÈME · DONNÉES · RÉSULTAT · RECUL` · `EXPLORER · INSPECTER · OUVRIR · INTERAGIR`.
3. **Vocabulaire technique** : anglais sans traduction. `Python · SQL · LLM · Agents · Pipelines · Scraping · Machine Learning · Data Visualization · Snowflake · ETL · MCP · API`. Traduire ferait amateur auprès d'un recruteur technique. Limité aux **noms** de technologies et disciplines, jamais aux phrases.
4. **Noms propres** : inchangés. `Job Agent`, `ARAM Stats`, `Commission Bot`, `AI Watch`, `Churn Prediction`, `Data Scientist / Builder`.

**Traductions arrêtées :**

| Avant | Après |
|---|---|
| `DISCOVER THE SYSTEM` | `EXPLORER LE SYSTÈME` |
| `LET'S BUILD SOMETHING.` | `CONSTRUISONS QUELQUE CHOSE.` |
| `Have a problem worth automating?` | `Un problème qui mérite d'être automatisé ?` |
| `USED IN 03 EXPERIMENTS` | `UTILISÉ DANS 03 EXPÉRIMENTATIONS` |
| `EXPERIMENTS · 05 SYSTEMS / 2023—2026` | `LABORATOIRE · 05 SYSTÈMES / 2023—2026` |

**Prêt pour l'anglais sans le construire :** pas de sélecteur visible en v1 · textes externalisés (`fr` / `en?`) jamais codés en dur · préfixe `/en` réservé non implémenté · `lang="fr"` sur `<html>`.

---

# 08 — SECTIONS — `VALIDÉ`

## 08.1 HERO

```text
RAYAN JEMAI

« Je n'aime pas faire deux fois la même chose. »

DATA SCIENTIST / BUILDER
```

Fond crème. Nom au centre/gauche en serif très grande. Système data vivant à droite / autour.
Menu : `PROFIL · LABORATOIRE · PARCOURS · CV · CONTACT`.

**Chorégraphie des 5 premières secondes (desktop) :**

| Temps | Événement |
|---|---|
| 0 → 1 s | Un système de particules / nœuds est **déjà en mouvement** |
| 1 → 2 s | Le système réagit à la position de la souris |
| 2 → 3 s | Certains éléments convergent |
| 3 → 4 s | Ils forment progressivement `RAYAN JEMAI` |
| 4 → 5 s | Nom + phrase + rôle affichés, le système continue de vivre |

**Contraintes :** pas de « ENTER WEBSITE » · pas d'intro de 10 s · pas de tutoriel · scroll possible immédiatement · curseur interactif dès l'arrivée.

**Indicateur de scroll :** `[ 01 ] EXPLORER LE SYSTÈME`, avec une petite ligne de données qui évolue.

> **Test d'acceptation du Hero (acté le 2026-09-05) : si on coupe entièrement le
> WebGL, le Hero doit rester excellent.** Nom en serif très grande + phrase +
> rôle, seuls, doivent déjà porter la présence recherchée. Si le Hero a besoin
> du système de particules pour être bon, c'est que le WebGL prend trop de
> place — le test tranche entre « voici mon système » et « regardez mon
> animation ». Cohérent avec le Definition of Done (§00.4) : le site reste
> entièrement utilisable sans WebGL, aucun contenu ne doit dépendre d'une
> animation.
>
> **Résultat (prototypé le 2026-09-05, `prototype-persistance-canvas/`) : test
> réussi.** Le vrai Data DNA (29 nœuds, 60 arêtes — `data/nodes.json`) rendu en
> halo autour du nom en Bodoni Moda, avec dérive continue + parallax souris,
> monte en ~1,2 s et ne bloque jamais le texte (nom, citation, rôle, menu en
> HTML réel, `z-index` au-dessus du canvas). Un bouton « masquer le système »
> a servi de test direct : système entièrement retiré → le Hero reste complet
> et lisible sans aucune perte. Positionnement des nœuds dérivé du graphe réel
> (angle = moyenne pondérée des pillars connectés, §04.7), jamais une position
> choisie à la main.
>
> **Corrigé le 2026-09-05 (contrainte de composition) : « le système encadre le
> nom, il ne le concurrence jamais ».** Le halo frôlait initialement les
> lettres pendant sa dérive — résolu **spatialement**, pas en z-index : halo
> décalé dans une zone dédiée à droite du bloc de texte, rayons compactés, et
> la dérive continue (rotation à 360°, qui balayait fatalement tout l'espace
> à chaque tour) remplacée par une **oscillation bornée** (~±12°, jamais assez
> ample pour quitter sa zone). Revérifié visuellement après correction : le
> halo tient dans sa zone, y compris pendant le parallax souris.
>
> **Décision actée (pas de formation littérale du nom par particules) :** avec
> seulement 29 nœuds réels, il est matériellement impossible d'épeler
> lisiblement « RAYAN JEMAI » par ces points seuls (il en faudrait des
> centaines). Plutôt que d'ajouter une couche de particules décoratives
> séparée pour tricher un effet spectaculaire, la décision est de **rester au
> halo** : le système montré reste le système réel, sans décoration
> superflue à côté. Cohérent avec le principe directeur (§00.2) — « personne
> qui construit des systèmes », pas « portfolio créatif ». Le mouvement retenu
> est *Data DNA réel → organisation → présence du nom*, jamais *particules →
> écriture spectaculaire*.
>
> **Hero validé structurellement.** Prochaine étape : prototype visuel du Data
> DNA (§13.3 étape 4) — tester si les 29 nœuds/60 arêtes produisent une
> visualisation lisible et intéressante en tant que page à part entière, pas
> seulement en halo décoratif.

## 08.2 PHILOSOPHIE
Le réseau du hero se transforme, les connexions se simplifient, la boucle apparaît. Très peu de texte.

## 08.3 PROFIL
Pas de timeline. Compétences connectées au système : survol de `PYTHON` → les expérimentations concernées ressortent + `UTILISÉ DANS 03 EXPÉRIMENTATIONS`. Clic → filtre le profil autour de Python.

> Répond à la question réelle du recruteur : *« OK, il dit qu'il maîtrise Python. Mais qu'est-ce qu'il a construit avec ? »*

## 08.4 LABORATOIRE
Galerie numérotée immédiatement lisible. Au hover, le nœud s'active, les connexions apparaissent, une prévisualisation s'affiche. Clic → route dédiée.

```
01  JOB AGENT           AUTOMATION / AI / PYTHON
02  ARAM STATS          DATA / API / VISUALIZATION
03  COMMISSION BOT      AI / AUTOMATION
04  AI WATCH            AI / AUTOMATION / DATA
05  CHURN PREDICTION    MACHINE LEARNING / INSURANCE
```

> **Power BI retiré du laboratoire (v4.4)** — pas de friction métier à raconter, uniquement une preuve de compétence outil. Reste dans le Data DNA (§04) comme nœud `capability`, sans page dédiée. Voir §A pour l'arbitrage (A-09).

## 08.5 PARCOURS
Pas de timeline. Ensemble de rôles + systèmes construits. Ex. `ECA ASSURANCES — DATA SCIENTIST / ÉTUDES ACTUARIELLES`, puis les compétences reliées aux projets.
Logique : *ce que tu as fait → avec quelles compétences → ce que ça a produit.*

## 08.6 CV
Zéro expérimentation. `VOIR LE CV` + `TÉLÉCHARGER LE PDF`. Le recruteur ne doit jamais chercher le bouton.

> **Rôle du CV — `VALIDÉ` :**
> **Le portfolio est l'expérience. Le CV est le résumé exportable de cette expérience.**
> Parcours voulu : `explorer → comprendre → être impressionné → télécharger le CV`.
> Parcours à éviter : `ouvrir le portfolio → chercher le CV → repartir`.

## 08.7 CONTACT
Fond noir. `CONSTRUISONS QUELQUE CHOSE.` · EMAIL · LINKEDIN · GITHUB · éventuellement *« Un problème qui mérite d'être automatisé ? »*

---

# 09 — EXPÉRIMENTATIONS — `STRUCTURE VALIDÉE` / contenu à produire

## 09.1 Règle de durée — `VALIDÉ`

> **Chaque projet doit être compréhensible en moins d'une minute.**
> Lecture rapide : `FRICTION → SYSTÈME → RÉSULTAT`. Puis, pour qui le veut : `EXPLORER LE SYSTÈME` donne la profondeur interactive.

## 09.2 Structure de page — `VALIDÉ`

```
EXPÉRIMENTATION 01
JOB AGENT
RECHERCHE D'EMPLOI AUTOMATISÉE

01 — FRICTION       Quel problème voulais-tu résoudre ?
02 — CONSTRUCTION   Qu'as-tu construit ?
03 — SYSTÈME        Comment ça fonctionne ?
04 — DONNÉES        Quelles données / technologies ?
05 — RÉSULTAT       Quel résultat ?
06 — RECUL          Ce que tu as appris / ce que tu améliorerais
```

> `RECUL` n'est pas décoratif : c'est la section qui distingue « voilà ce que j'ai codé » d'une démonstration de raisonnement. Elle sert directement `ITÉRER`.

## 09.3 Univers et traitements — `VALIDÉ`

| # | Projet | Univers | Desktop | Mobile |
|---|---|---|---|---|
| 01 | **Job Agent** | Système / agents / automatisation | **`webgl`** — pipeline multi-agents en 3D | Diagramme SVG animé |
| 02 | **ARAM Stats** | Data / gaming / statistiques | `dataviz` interactive | `dataviz` 2D simplifiée |
| 03 | **Commission Bot** | Finance / conversational AI | Interface conversationnelle + viz | Interface simplifiée |
| 04 | **AI Watch** | Information / temporalité / flux | Flux temporel / data stream | Flux 2D vertical |
| 05 | **Churn Prediction** | Assurance / ML / probabilités | Visualisation ML / probabiliste | Graphiques statiques |

> **Job Agent est le seul projet WebGL prévu à ce jour.**
> Règle : *« Est-ce que la 3D permet de mieux comprendre ou ressentir ce que j'ai construit ? »* Si oui → 3D. Sinon → excellente visualisation 2D ou éditoriale.

```
JOB SOURCES → [AGENT · AGENT · AGENT] → FILTER → MATCH → OUTPUT
```

## 09.4 Contraintes de contenu

| Projet | Contrainte |
|---|---|
| Power BI *(nœud capability, hors laboratoire)* | Si un jour montré (capture, mention), anonymisation ou données fictives obligatoires. Pas de screenshot brut. |
| Commission Bot | Anonymisé, aucune info financière sensible |
| Churn Prediction | Implémentation originale **perdue** → reconstruction méthodologique transparente |

## 09.5 Tableau à remplir — **LIVRABLE BLOQUANT N°1**

| # | Projet | Friction | Construit | Chiffre qui prouve | Stack | Preuve |
|---|---|---|---|---|---|---|
| 01 | Job Agent | La recherche d'emploi manuelle (scanner plusieurs sites, lire chaque offre, juger sa pertinence, adapter l'angle de candidature) est répétitive et ne scale pas sur plusieurs zones géographiques cherchées en parallèle. | Un pipeline multi-agents : scraping (Hellowork + jobup.ch) → indexation RAG du profil candidat (ChromaDB, embeddings maison, pas de framework) → agent de scoring (géographie déterministe hors RAG + matching sémantique par atome + arbitrage LLM) → agent de génération d'analyse structurée → API + dashboard de tri. Aucune soumission automatique — la validation humaine reste le seul chemin vers une action externe. | **107 offres scorées**, pipeline entièrement tracé (3 niveaux de trace JSON par offre, audit complet a posteriori). La recherche RAG par atome (et non par exigence composite) détecte des gaps de compétence qu'une recherche groupée manque silencieusement — vérifié sur un cas réel (offre ISO 13485). | Python 3.11 · Playwright · SQLite · ChromaDB · `sentence-transformers` (embeddings multilingues locaux) · API Mistral (`mistral-large`) · FastAPI · Docker · GitHub Actions (cron quotidien) · Render.com | `live-demo` — [job-agent-otyo.onrender.com](https://job-agent-otyo.onrender.com/) + `repo` public — [github.com/Ayreon69/job-agent](https://github.com/Ayreon69/job-agent) |
| 02 | ARAM Stats | Riot bloque volontairement l'accès aux données de la file ARAM : Mayhem (`match-v5` renvoie 403 sur la queue 2400) — impossible de savoir quels champions, augments et objets dominent réellement ce mode. | Un crawler en boule de neige qui exploite l'API locale du client League (LCU) au lieu de l'API publique fermée, stocke les parties dans SQLite, et les expose via deux interfaces : un explorateur local et un site public dont le moteur de filtrage tourne entièrement dans le navigateur, sans serveur derrière. | **150 140 parties** collectées, 1,5 M lignes joueur, base de 2,0 Go. Le site filtre et agrège **1,5 M de lignes en 11 à 37 ms** dans le navigateur — plus rapide qu'un aller-retour réseau. | Python 3.11 · SQLite (WAL) · `requests` / `ThreadPoolExecutor` · `numpy` (encodage binaire) · `Pillow` (WebP) · `psutil` / `ctypes` (garde-fous mémoire) · JS vanilla + `TypedArray` / `ArrayBuffer` · `DecompressionStream` natif · Cloudflare Pages | `live-demo` — [mayhem-7wz.pages.dev](https://mayhem-7wz.pages.dev/) |
| 03 | Commission Bot | Comprendre et calculer les commissions d'assurance (précompte, linéaire) demande de naviguer un script métier complexe et un fichier de paramétrage Excel — une expertise concentrée chez peu de personnes, difficile à transmettre. | Un assistant conversationnel qui répond en langage naturel aux questions sur les règles de calcul, sans jamais calculer lui-même : le code source et le paramétrage sont injectés tels quels dans le contexte du LLM (pas de RAG — le contexte tient largement sous la limite de 128k tokens), avec anonymisation systématique des noms internes avant tout envoi à l'API. | Base de connaissance ~22 000 tokens couvrant l'intégralité des règles de calcul ; réponses sourcées et honnêtes (le bot cite le code, n'invente jamais une règle). *Projet à retravailler — pas encore de métrique d'usage réelle.* | Python · Gradio · API Mistral (`mistral-large`) · `pandas` (lecture Excel → Markdown) | `case-study` anonymisée uniquement — **le dépôt reste privé** : le code source contient les vrais noms de périmètres et produits d'assurance de l'employeur, non anonymisés à la source (seul l'output du bot l'est). |
| 04 | AI Watch | Suivre l'actualité IA en continu pour rester à jour (agentic coding, Claude Code, automatisation, migration SAS→Python) devient impossible à la main au-delà de quelques sources — 34 flux suivis, l'essentiel noyé dans le bruit. | Un collecteur qui tourne seul sur GitHub Actions (le PC n'a pas besoin d'être allumé), agrège ~34 sources RSS/scraping ciblé, score chaque item selon un profil de pertinence personnel via l'API Gemini, et publie un digest quotidien + hebdomadaire. Une version publique du même générateur republie les actus (jamais les résumés perso), où chaque lecteur développe un article avec sa propre clé API — gratuite pour moi à héberger, la clé ne quitte jamais le navigateur du lecteur. | **15 733 fiches en base**, 180 nouvelles le jour de la mesure. Rendement mesuré et arbitré par source : 7 sources désactivées (26 % du volume collecté pour 5 % des éléments jugés utiles), ex. Claude Code releases à 100 % de rendement vs Next.ink à 7 %. | Python · GitHub Actions (cron) · API Gemini (tier gratuit) · `feedparser`/`httpx` · Cloudflare Pages + Worker (lecture d'article côté client) · Obsidian (stockage source) | `live-demo` — [veille-ia.pages.dev](https://veille-ia.pages.dev/) — dépôt source privé (contient le vault personnel complet) |
| 05 | Churn Prediction | Chez ECA Assurances, un fort volume de signatures clients masquait un problème structurel : plus de 50 % des clients résiliaient avant leur première année, sans signal d'alerte précoce pour agir avant la résiliation plutôt que la constater après coup. | Un pipeline de classification supervisée pour anticiper le risque de résiliation : EDA → pipeline data → feature engineering → comparaison de plusieurs modèles → gradient boosting retenu comme modèle final. | **Recall de 85%** sur la classe résiliation — priorité donnée à détecter un maximum de clients à risque réel, quitte à accepter plus de faux positifs, cohérent avec un cas d'usage où manquer un client qui va résilier coûte plus cher qu'une relance inutile. | Python · XGBoost / LightGBM · pandas · feature engineering manuel | `case-study` — **implémentation originale perdue** (voir §09.4) : reconstruction méthodologique transparente à partir de la mémoire du projet, sans code ni capture d'origine à produire comme preuve. |

**Automatisations professionnelles à rattacher au graphe** (nœuds `experience`, pas `experiment`) : automatisation des commissions · migration SAS → Python.

---

# 10 — MOBILE & ACCESSIBILITÉ — `CONCEPT VALIDÉ`

## 10.1 Principe

**Conception desktop-first. Mobile consultable via une représentation différente, pas une réduction.**

> **Desktop = système spatial · Mobile = système indexé.**
> La donnée est identique, la représentation change. Un data scientist choisit sa représentation en fonction du support.

Raison : le Data System repose sur trois interactions inexistantes sur mobile — position du curseur, hover, survol prolongé. Miniaturiser le graphe donnerait un nuage de points illisible sur 375 px.

## 10.2 Un seul livrable pour trois problèmes

Le **fallback sémantique** (SEO, accessibilité) et la **version mobile** sont le même artefact : une représentation HTML structurée, rendue côté serveur, du graphe complet.

```
Une seule source de données
        │
        ├── Desktop  → couche WebGL/Canvas par-dessus le HTML
        ├── Mobile   → le HTML structuré, mis en forme éditoriale
        └── Crawler / lecteur d'écran / no-JS → le HTML brut
```

## 10.3 Trois niveaux de rendu

| Niveau | Condition | Data System |
|---|---|---|
| **Complet** | Desktop, pointeur fin, pas de `reduced-motion` | WebGL / Canvas, particules, réaction souris, curseur contextuel, chorégraphie 5 s |
| **Indexé** | Mobile / tablette / pointeur grossier | Liste éditoriale structurée + connexions au tap. Pas de particules, pas de curseur. |
| **Statique** | `prefers-reduced-motion: reduce`, no-JS, crawler | Le HTML seul, sans animation |

Détection par `matchMedia('(pointer: fine)')` et `(prefers-reduced-motion)`, **pas par user-agent**.

## 10.4 Adaptation par section

| Section | Mobile |
|---|---|
| **HERO** | Nom en très grande serif. Constellation légère en fondu, 2 s, puis figée. Pas de convergence. |
| **PHILOSOPHIE** | Les 5 étapes en composition verticale éditoriale, révélées au scroll |
| **PROFIL** | Clusters `AI / AUTOMATION / DATA` dépliables. Tap sur une compétence → expérimentations liées. `UTILISÉ DANS 03 EXPÉRIMENTATIONS` devient le mécanisme principal. |
| **LABORATOIRE** | Liste numérotée verticale, très éditoriale, avec les tags de cluster |
| **Page expérimentation** | 6 sections identiques ; visualisation 2D ou statique selon `mobileTreatment` |
| **PARCOURS** | Blocs rôle → compétences → projets, en liens tappables |
| **CV / CONTACT** | Identiques |

## 10.5 Règles non négociables

- Cible de tap : 44 px minimum
- Aucun état dépendant du hover sans équivalent au tap
- Pas de curseur contextuel
- Pas de WebGL sur la page Job Agent : diagramme SVG animé
- Grain et chorégraphie des fonds conservés : coût nul, portent l'identité
- Tester sur un vrai téléphone milieu de gamme, pas sur l'émulateur

---

# 11 — DIRECTION TECHNIQUE — `OUVERT`

**Non validé. À trancher après les wireframes.** Ne pas figer maintenant.

| Couche | Piste | Note |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Routes projet + metadata par page |
| Styling | Tailwind CSS v4 | |
| Composants | shadcn/ui | |
| Contenu | MDX | Case studies en français |
| i18n | next-intl | Installé, **non activé** en v1 |
| Scroll | Lenis | Désactivé sous `reduced-motion` |
| Motion UI | Motion | Transitions de contenu entre routes |
| Séquences scroll | GSAP + ScrollTrigger | |
| 3D | React Three Fiber + Drei | Canvas dans le layout racine (§07.1) |
| Hébergement | Vercel | |

---

# 12 — WIREFRAMES — `À FAIRE`

**Prérequis avant de commencer :**
- [ ] Tableau §09.5 rempli
- [ ] Graphe complet dérivé (§04)
- [ ] Prototype de persistance validé (§07.1)

**Livrables attendus :**
- [ ] Wireframes basse fidélité, **desktop et mobile en parallèle** (pas mobile après)
- [ ] Pour chaque écran : quel profil visiteur il sert (§05.2)
- [ ] Comportement du Data System à chaque état
- [ ] Wireframe de la page expérimentation générique + le cas particulier Job Agent WebGL

---

# 13 — ROADMAP

## 13.1 Avancement

| Chantier | v3.1 | v4.0 |
|---|---|---|
| Intention & critères de réussite | *(non tracé)* | ██████████ 100 % |
| Positionnement | 100 % | ██████████ 100 % |
| Philosophie | 100 % | ██████████ 100 % |
| Direction artistique | 100 % | ██████████ 100 % |
| Parcours recruteur | *(non tracé)* | ██████████ 100 % |
| UX / Navigation | 100 % | ██████████ 100 % |
| Motion | 100 % | ██████████ 100 % |
| Architecture & routing | 100 % | ██████████ 100 % |
| Langue & nommage | 100 % | ██████████ 100 % |
| Mobile & accessibilité | 70 % | ████████░░ 85 % |
| Sections | 95 % | ██████████ 100 % |
| Data DNA (structure) | 80 % | ██████████ 100 % *(rendu visuel validé sur prototype réel — §04.8)* |
| **Data DNA (données réelles)** | **30 %** | **█████████░ 90 %** *(4 clusters figés, 7/7 grilles remplies, graphe v1 dérivé et figé en `data/nodes.json`+`data/edges.json` — reste la rédaction complète des 6 sections de copie par page)* |
| **Contenu projets** | **50 %** | **██████████ 100 %** *(5/5 expérimentations + 2/2 expériences remplies)* |
| Wireframes | 0 % | ░░░░░░░░░░ 0 % |
| Design détaillé | 0 % | ░░░░░░░░░░ 0 % |
| Développement | 0 % | ░░░░░░░░░░ 0 % |

> **Les deux lignes en gras n'ont pas bougé depuis la v1.** Tout le reste est à 100 %. Le blueprint conceptuel est terminé ; ce qui manque n'est plus de la réflexion, c'est de la matière.

## 13.2 Chemin critique

```
CONTENU PROJETS  →  DATA DNA  →  WIREFRAMES  →  DESIGN  →  DEV
    (100 %)         (100 %)       (lo-fi ✅)     (0 %)
                                                   ▲
                                             goulot unique

PROTOTYPES VALIDÉS
  persistance du canvas (§07.1)  →  ✅ continuité entre routes confirmée
  Hero réel (§08.1)              →  ✅ excellent même sans WebGL
  Data DNA visuel (§04.8)        →  ✅ concept validé, 27/53 canonique
```

> **Le goulot n'est plus le Data DNA.** Les trois risques techniques et
> conceptuels sont levés par des prototypes qui tournent. Ce qui reste devant
> est du design détaillé puis du développement — pas de la réflexion.

## 13.3 Prochaines actions

**Étape 1 — la seule qui débloque quoi que ce soit** ✅ terminée
- [x] Ouvrir les dossiers des 5 projets et remplir le tableau §09.5
- [x] Renseigner la grille d'extraction §04.4 pour chacun (5 expérimentations + 2 expériences)

**Étape 2** ✅ terminée
- [x] Dériver le graphe : nœuds, arêtes typées, poids (§04.7, v1)
- [x] Figer le graphe v1 en fichier de données consommable (`data/nodes.json` / `data/edges.json`)
- [x] Prototype de persistance du canvas entre routes (D-07) — validé, voir §07.1
- [x] Figer les slugs (D-13) — kebab-case sans préfixe numérique
- [x] Vérifier l'ancienneté affichée (A-08) — 4 ans confirmés

**Étape 3** ✅ terminée
- [x] Polices avec jeu d'accents complet et palette (D-05, D-06)
- [x] Valider les seuils de performance (D-12) — mesuré sur le prototype §07.1
- [x] Rédiger `design-system.md` et `CLAUDE.md` (§00.3 intégré tel quel)

**Étape 3bis** ✅ terminée — nettoyage du Data DNA (review externe, 2026-09-05)
- [x] Retirer `pandas`, `gradio`, `cloudflare-pages` du graphe (incidentels, sans valeur de mise en relation) — 32→**29 nœuds**, 67→**60 arêtes**
- [x] Acter la règle « le Data DNA représente comment Rayan construit, pas tout ce qu'il sait utiliser » (§04.7)
- [x] Acter le test d'acceptation du Hero : sans WebGL, reste-t-il excellent ? (§08.1)

**Étape 4** ✅ terminée — prototypes visuels
- [x] Wireframe basse fidélité de la homepage complète (`wireframe-homepage-lofi.html`)
- [x] Prototype réel du Hero + test d'acceptation « sans WebGL » (§08.1)
- [x] Prototype visuel du Data DNA en page à part entière (§04.8) — concept **validé**
- [x] Fixer l'état canonique du graphe affiché : 29/60 source → **27/53 narratif** (D-14 bis, §04.7)

> **À partir de maintenant : plus d'ajout au blueprint, seulement du resserrement.**
> Sur toute nouvelle idée, se demander « qu'est-ce qu'on peut enlever sans perdre
> l'idée ? » plutôt que « qu'est-ce qu'on peut ajouter ? ». Voir `CLAUDE.md`.
> Le prototype §04.8 a appliqué la règle deux fois : retrait de `BUILD` et retrait du
> calque « territoires de cluster ».

**Étape 4 — dans cet ordre**
- [x] Wireframe basse fidélité de la homepage complète (HERO→CONTACT) — `wireframe-homepage-lofi.html`, avec filtre par profil visiteur (§05.2) intégré pour vérifier quelle section sert qui
- [ ] Wireframes desktop + mobile détaillés (surtout vérifier hiérarchie visuelle et densité)
- [x] Prototype réel du Hero — construit dans `prototype-persistance-canvas/` (§08.1, résultat détaillé ci-dessous)
- [ ] Prototype visuel du Data DNA — le modèle de données est validé (§04.7), son rendu ne l'est pas (Hero validé structurellement le 2026-09-05, voir §08.1)
- [ ] Ensuite seulement : développement du site

---

# A — REGISTRE DES ARBITRAGES

| # | Point | Statut | Résolution |
|---|---|---|---|
| ~~A-01~~ | Boucle philosophie | ✅ | `FRICTION → COMPRENDRE → CONSTRUIRE → AUTOMATISER → ITÉRER` |
| ~~A-02~~ | Structure case study | ✅ | 6 sections, en français |
| ~~A-03~~ | Timeline | ✅ | Aucune timeline nulle part |
| ~~A-04~~ | Taxonomie | ✅ | AI + Automation + Data **convergent vers** Build |
| ~~A-05~~ | Pilier BUILD vide | ✅ | `BUILD` est une sortie, pas un pilier |
| ~~A-06~~ | Routing | ✅ | Vraies routes `/laboratoire/[slug]` + récit continu sur `/` |
| ~~A-07~~ | Langue | ✅ | Français de référence · renommage `LABORATOIRE` / `PARCOURS` |
| ~~A-08~~ | Ancienneté affichée | ✅ | Confirmé le 2026-09-05 : en poste chez ECA Assurances depuis septembre 2022, soit **4 ans pile** à date. Afficher `4 ANS` (éviter `4+` tant que le passage à 5 n'est pas anticipé). |
| ~~A-09~~ | Power BI dans le laboratoire | ✅ | Retiré du LABORATOIRE (5 expérimentations au lieu de 6) : pas de friction métier, échoue le test §00.3 question 3. Reste nœud `capability` dans le Data DNA. |
| ~~A-11~~ | Contradiction budget JS / chorégraphie hero | ✅ | Le seuil « JS < 200 Ko hors chunk 3D chargé à la demande » contredisait §08.1 (système visible dès 0-1 s). Résolu : deux budgets séparés (texte/interface vs chunk 3D), mesurés indépendamment sur le prototype (172 Ko / 234 Ko gzip), le 3D chargeant en parallèle sans jamais bloquer le LCP du texte. |
| ~~A-10~~ | Cluster ML absent de la topologie | ✅ | Ajout d'un **4ᵉ cluster ML**, distinct de AI et de DATA (§04.2). Motivé par Churn Prediction : ML classique sans LLM/agentique, aucune arête honnête vers AI ; le rattacher à DATA aurait raconté « ML = sous-compétence de la donnée ». AI reste le centre de gravité et le plus gros cluster — le positionnement §01 n'est pas remis en cause. |

---

# B — REGISTRE DES DÉCISIONS OUVERTES

| # | Décision | Impact | Échéance |
|---|---|---|---|
| ~~D-02~~ ~~D-03~~ ~~D-04~~ ~~D-11~~ | Curseur · CV/Parcours · Projet WebGL · Mobile | ✅ Résolus | — |
| **D-01** | Balisage exact du fallback sémantique | Fusionné avec D-11 : même livrable HTML | Avec les wireframes |
| ~~D-05~~ | Valeurs hex + accents projet | ✅ | Crème `#F4EFE4` · noir `#0D0D0F` · 5 accents mats, un par expérimentation (§03.3). |
| ~~D-06~~ | Familles typographiques | ✅ | Bodoni Moda (display) · IBM Plex Mono (technique) · IBM Plex Sans (courant). Accents français vérifiés — sous-ensemble Google Fonts standard (§03.4). |
| ~~D-07~~ | Persistance du canvas entre routes | ✅ Résolu — prototype validé le 2026-09-05 (§07.1). Le rendu final du Data System (composition visuelle du graphe §04.7) reste, lui, à faire en phase design. | — |
| **D-08** | Format des démos par projet | Dépend des autorisations | Avec le tableau §09.5 |
| ~~D-09~~ | Source finale du CV PDF | ✅ Résolu le 2026-09-06 : `public/CV_Rayan_Jemai_2026.pdf`, servi par le site, mêmes coordonnées que la section CONTACT (`lib/identity.ts`). | — |
| ~~D-12~~ | Validation des seuils de performance (§00.4) | ✅ | Mesuré sur le prototype §07.1 : JS texte/interface 172 Ko gzip, chunk 3D 234 Ko gzip. Seuils scindés en deux budgets indépendants plutôt qu'un seul mélangé — voir A-11. |
| ~~D-13~~ | Slugs d'URL définitifs | ✅ | `/laboratoire/job-agent` — kebab-case, **sans préfixe numérique**. Raison : le numéro affiché (`EXPÉRIMENTATION 01`) est un label de présentation, pas une clé stable — l'ordre peut changer (l'a déjà fait : retrait de Power BI, arbitrage A-09) sans casser une seule URL. Cohérent avec les `slug` déjà posés dans `data/nodes.json`. |
| ~~D-14~~ | Matière factuelle des 2 nœuds `experience` | ✅ Résolu — grilles §04.4.06/§04.4.07 remplies | — |
| ~~D-15~~ | État canonique du graphe **affiché** (§04.7) | ✅ Résolu le 2026-09-05 sur mesure au prototype §04.8 : **dataset source 29/60, graphe narratif 27/53**. `build` retiré (sortie tautologique : `produces` poids 1 depuis les 7 projets, aucune information distinctive — reste un concept éditorial du site, pas un nœud). Nœuds sans arête retirés par calcul (aujourd'hui `power-bi`) et **non signalés au visiteur** : le Data DNA raconte le profil, pas les décisions de construction du Data DNA. | — |
| ~~D-17~~ | **Alimentation des univers interactifs** | ✅ **Acté le 2026-09-06.** Un univers est alimenté par un **instantané FIGÉ ET DATÉ**, exporté une fois, versionné, et **cohérent avec le texte publié à la date de l'export**. Jamais de réexport live implicite, jamais de lecture directe d'une base de projet. Raison mesurée : les projets sources continuent de tourner et **contredisent déjà les chiffres publiés** — `mayhem.db` compte 239 913 parties quand la page en affiche 150 140, et 74 323 sur le patch 16.16 quand le §06 en cite 102 624 ; la veille compte 86 libellés de source quand la page en annonce ~34. Un univers branché en direct produirait donc une page qui se contredit elle-même. Conséquences opérationnelles : l'export est un script lancé À LA MAIN (`scripts/export-aram-snapshot.py`), jamais au build ; l'instantané porte sa date **à l'écran** ; et le patch retenu pour ARAM est **16.17**, choisi parce qu'aucun de ses chiffres n'est cité dans le texte figé — le prendre n'ouvre aucune contradiction. | — |
| ~~D-18~~ | **WebGL sur la page Job Agent** | ✅ **Acté le 2026-09-06 — §09.3 est périmé sur ce point.** Job Agent n'est plus « le seul projet WebGL » : son univers est une décomposition d'exigences en atomes étiquetés, c'est-à-dire du texte positionné. Le WebGL n'y apporterait aucune compréhension supplémentaire et coûterait 234 Ko. Règle générale retenue : **2D/SVG/DOM par défaut, WebGL seulement quand il apporte une compréhension**. Conséquence : `three.js` ne sert plus qu'au halo persistant du HERO. | — |
| ~~D-16~~ | Rendu visuel du Data DNA (bloqué depuis §04.7 v1) | ✅ Résolu le 2026-09-05 : concept **validé** sur prototype réel (§04.8). Le graphe statique seul ne gagne pas sa place — **c'est le niveau C (interaction) qui rend le Data DNA supérieur à une liste de compétences.** Conséquence : la page ne peut pas être une image, et le fallback sans JS doit être une liste structurée réelle. | — |

---

# C — RÉFÉRENCES

| Référence | À retenir | Limite |
|---|---|---|
| **Valentin Gassend** | Présence énorme du nom ; richesse au hover ; WebGL + React + GSAP avec structure lisible | Ne pas copier l'esthétique |
| **Justine Soulié** | « Le WebGL est une interface, pas une décoration » ; scène par projet | Conserver notre navigation classique |
| **Marco Ayuste** | Un CV ne montre pas comment quelqu'un pense et construit. Architecture 3D + HTML conjointe | — |
| **Stefan Vitasović** | Typo + animations + WebGL en restant minimaliste ; optimisation du rendu | — |
| **Alex Dubranov** | Immersif **avec** clarté et raison d'être des interactions ; formats de projet différenciés | — |
| **Webby — Best Data Visualization** | Principe : la donnée devient matière visuelle et narrative | Pas « un joli réseau de particules » |
| **Active Theory** | Arbre 3D + galerie ; esprit collection d'expériences | Pas de navigation non conventionnelle |
| **The Silence Museum** | Immersion, rythme, transitions, lumière, espace | Pas d'audio |
| **EK Development Lab** | « Expérience → technologie → explication » | Remonter en registre premium |
| **HAS Studio** | « Show, don't tell » | Éviter le rendu brut de playground |
| **Tomoya Okada** | Logique de collection / archive | Ne pas copier une simple archive |
| **Andrew Kassab** | Mise en page CV et projets | Pas une référence esthétique |
| **Gen-02** | Plafond d'ambition | Ne pas devenir un monde 3D obligatoire |
| **Corentin Bernadou** | WebGL editorial, dialogue 2D / 3D | Navigation trop expérimentale |
| **D-LAB / VEIL** | DA premium sombre / chaude | **Contre-exemple UX** : scroll bloqué, boutons inutilisables |
| **AMIX**, **Prime Intellect** | Sensation de technologie | *(à documenter)* |

---

# D — CHANGELOG

| Date | Version | Modification |
|---|---|---|
| 2026-09-04 | v1.0 | Création. Consolidation initiale, schéma de données, chemin critique, registre de décisions. |
| 2026-09-04 | v2.0 | Intégration de la fiche de référence DA. Résolu D-03. Créé le registre des arbitrages. |
| 2026-09-04 | v3.0 | Intégration du blueprint. Résolus A-01 à A-05, D-02, D-04. Nouveaux arbitrages A-06 à A-08. |
| 2026-09-04 | v3.1 | Résolus A-06 (routes), A-07 (français), D-11 (mobile indexé). Fusion D-01 / D-11. |
| 2026-09-04 | v4.0 | **Restructuration complète en 14 sections.** **Ajouts :** §00 intention, principe directeur, Definition of Done avec seuils de performance proposés · §04.3 règle de dérivation du graphe · §04.4 grille d'extraction par projet · §03.6 règle « même ADN, univers différents » avec la liste de ce qui varie et ne varie jamais · §05.2 parcours des trois profils de visiteur avec contraintes chiffrées · §08.6 rôle du CV. **Conservés en annexes** malgré la structure proposée : registres d'arbitrages et de décisions, références, changelog. |
| 2026-09-04 | v4.1 | **Projet ARAM Stats rempli (1/6).** Tableau §09.5 et grille §04.4.02 renseignés à partir du code source (`API LoL`). Preuve : `live-demo` sur mayhem-7wz.pages.dev. |
| 2026-09-04 | v4.2 | **Projet Job Agent rempli (2/6).** Tableau §09.5 et grille §04.4.01 renseignés à partir du code source (`multi-agent-project/job-agent`). Historique git nettoyé des données personnelles (CV, profil candidat, analyses générées) avant republication publique du dépôt — sauvegarde locale conservée. Preuve : `live-demo` sur job-agent-otyo.onrender.com + repo public github.com/Ayreon69/job-agent. |
| 2026-09-04 | v4.3 | **Projet Commission Bot rempli (3/6).** Tableau §09.5 et grille §04.4.03 renseignés à partir du code source (`Bot commission`). **Repo confirmé privé et à garder privé** : `Documentation/*.py`/`*.xlsx` contiennent les vrais noms de périmètres/produits d'assurance de l'employeur, non anonymisés à la source. Preuve limitée à `case-study` anonymisée — cohérent avec la contrainte déjà posée en §09.4. |
| 2026-09-04 | v4.4 | **Power BI retiré du LABORATOIRE (arbitrage A-09).** Pas de friction métier — échoue le test §00.3. Le laboratoire passe de 6 à **5 expérimentations**. Power BI reste un nœud `capability` dans le Data DNA (§04). Mis à jour : §08.4 (galerie), §09.3 (tableau univers), §09.4 (contraintes), §09.5 (tableau), §07.2 (noms propres), traduction `05 SYSTÈMES`, §12 (wireframes). |
| 2026-09-04 | v4.5 | **Projet AI Watch rempli (4/5).** Tableau §09.5 et grille §04.4.04 renseignés à partir du vault Obsidian (`IA/Veille IA`). Preuve : `live-demo` sur veille-ia.pages.dev — dépôt source privé conservé ainsi (vault personnel complet). |
| 2026-09-04 | v4.6 | **Projet Churn Prediction rempli (5/5) — LIVRABLE BLOQUANT N°1 COMPLET.** Tableau §09.5 et grille §04.4.05 reconstruits honnêtement à partir de la mémoire du projet (implémentation originale perdue, aucun code source disponible) : recall 85% confirmé, stack Python/XGBoost-LightGBM. Le tableau §09.5 est désormais entièrement rempli pour les 5 expérimentations du laboratoire. Prochaine étape du chemin critique : dériver le graphe complet (nœuds/arêtes) à partir des 5 grilles §04.4. |
| 2026-09-05 | v4.7 | **Ajout du cluster ML (arbitrage A-10).** Topologie §04.2 révisée : AI / ML / AUTOMATION / DATA → BUILD. Motivé par Churn Prediction (ML classique, aucune arête honnête vers AI ni DATA). Schéma §04.5 mis à jour (`cluster: 'ai' \| 'ml' \| 'automation' \| 'data'`). Grille §04.4.05 précisée avec une ligne ML dédiée. Dérivation du graphe complet mise en pause : 2 nœuds `experience` professionnels (automatisation des commissions, migration SAS→Python) manquent encore de matière factuelle pour être dérivés honnêtement — voir D-14. |
| 2026-09-05 | v4.8 | **Grilles §04.4.06/§04.4.07 remplies** (nœuds `experience` : automatisation des commissions, migration SAS→Python). D-14 résolu. **Graphe complet dérivé (§04.7, v1)** : granularité `capability` arbitrée « intermédiaire » (8 compétences auto-évaluées + technologies nommables, pas les bibliothèques utilitaires incidentes). Nœuds pillar/output/experiment/experience/capability + arêtes `feeds` (vers clusters) et `uses` (vers capability) entièrement tracées depuis les 7 grilles réelles, aucune arête inventée. `power-bi` identifié comme nœud isolé (0 arête), cohérent avec l'arbitrage A-09. Contenu projets à 100 %, Data DNA (données réelles) à 80 % — reste à figer le graphe en fichier de données consommable. |
| 2026-09-05 | v4.9 | **Graphe figé en données : `data/nodes.json` (35 nœuds) + `data/edges.json` (70 arêtes).** Validé référentiellement (script Python, 0 arête cassée). Années manquantes obtenues directement (Churn Prediction 2023, automatisation commissions 2025, migration SAS→Python 2026) plutôt qu'inventées. Convention actée : champ `null` pour tout attribut non applicable à un type de nœud, plutôt qu'une valeur fabriquée. Data DNA (données réelles) à 90 %. |
| 2026-09-05 | v4.10 | **Audit conceptuel du graphe (review externe).** Trois clarifications actées dans le blueprint : (1) `cluster` = centre de gravité du nœud, pas la liste exhaustive de ses relations (§04.5) ; (2) la règle « aucune arête inventée » (§04.3) s'applique identiquement aux nœuds `experience` et `experiment` ; (3) §04.7 distingue désormais **data model validé** (nœuds/arêtes, `data/*.json`) de **rendu visuel non validé** (densité réelle jamais testée à l'écran). **Élagage du graphe** : `docker`, `render`, `fastapi` retirés (3 nœuds à arête unique sans valeur de mise en relation) — 35→**32 nœuds**, 70→**67 arêtes**. Restent mentionnés en texte dans Job Agent, rien de perdu. |
| 2026-09-05 | v4.11 | **D-07 résolu — prototype de persistance du canvas validé (§07.1).** `prototype-persistance-canvas/` (Next.js 16 App Router + React Three Fiber) : canvas dans `app/layout.tsx`, testé sur 2 allers-retours entre `/` et `/laboratoire` en navigation client-side. Timestamp de montage strictement identique aux deux navigations → composant jamais démonté. Comportement conforme à la doc officielle Next.js 16 (layouts ne re-rendent pas, client components si). Bug d'hydratation SSR découvert et corrigé en cours de route (timestamp déplacé dans un `useEffect`). **Le concept de continuité est confirmé : le développement peut s'appuyer dessus sans réserve.** Chemin critique : Data DNA à 90 %, risque technique n°1 levé. |
| 2026-09-05 | v4.12 | **D-13 et A-08 résolus.** Slugs d'URL figés en kebab-case sans préfixe numérique (`/laboratoire/job-agent`) — le numéro affiché reste un label de présentation, découplé de la clé d'URL, cohérent avec les `slug` déjà posés dans `data/nodes.json`. Ancienneté confirmée : 4 ans pile chez ECA Assurances (sept. 2022 → sept. 2026). Étape 2 du chemin critique entièrement terminée. |
| 2026-09-05 | v4.13 | **Étape 3 : D-05, D-06 et D-12 résolus.** Couleurs figées (crème `#F4EFE4`, noir `#0D0D0F`, 5 accents mats un par expérimentation, §03.3). Typographie figée (Bodoni Moda / IBM Plex Mono / IBM Plex Sans, §03.4) — accents français vérifiés via le sous-ensemble `latin` standard de Google Fonts (couvre é è ê à ç ù û î ô, `œ`/`Œ`, `«` `»`), aucune police exotique nécessaire. **Seuils de performance mesurés sur le prototype §07.1** (D-12) : JS texte/interface 172 Ko gzip (< 200 Ko, seuil tenu), chunk 3D 234 Ko gzip (nouveau seuil dédié, incompressible pour ce stack). **Tension découverte et résolue (A-11)** : l'ancien seuil « JS < 200 Ko hors chunk 3D chargé à la demande » contredisait la chorégraphie hero (§08.1, système visible dès 0-1s) — scindé en deux budgets mesurés indépendamment, le 3D chargeant en parallèle sans bloquer le LCP du texte. **`design-system.md` et `CLAUDE.md` rédigés** à la racine du projet (§00.3 copié tel quel dans `CLAUDE.md`, comme prévu). **Étape 3 entièrement terminée — plus aucune décision ouverte avant les wireframes.** |
| 2026-09-05 | v4.14 | **Review externe globale (8,5/10) + deuxième passe de nettoyage du Data DNA.** `pandas`, `gradio`, `cloudflare-pages` retirés du graphe (incidentels, sans valeur de mise en relation entre projets) — 32→**29 nœuds**, 67→**60 arêtes**. **Nouvelle règle forte actée (§04.7, `CLAUDE.md`) : le Data DNA représente comment Rayan construit, pas tout ce qu'il sait utiliser** — distincte de la règle « aucune arête inventée » (véracité vs intérêt narratif, les deux se cumulent). **Test d'acceptation du Hero acté (§08.1) :** sans WebGL, le Hero doit rester excellent, sinon le WebGL prend trop de place. **Bascule de mode de travail actée : le projet ne s'enrichit plus, il se resserre** — sur toute nouvelle idée, chercher ce qu'on peut enlever plutôt qu'ajouter. Roadmap réordonnée : wireframes → prototype Hero → prototype visuel du Data DNA → développement. |
| 2026-09-05 | v4.15 | **Wireframe basse fidélité de la homepage complète** (`wireframe-homepage-lofi.html`, HERO→CONTACT) construit et itéré avec un filtre par profil visiteur (§05.2) intégré. Après review : PROFIL relié aux vrais projets via `data/edges.json` (plus de clusters génériques), une phrase de friction par projet en LABORATOIRE, impact ajouté en PARCOURS, CV désolennisé. **Prototype réel du Hero construit** (`prototype-persistance-canvas/`) : le vrai Data DNA (29 nœuds, 60 arêtes) en halo autour du nom en Bodoni Moda, dérive continue + parallax souris, positions dérivées du graphe réel (jamais choisies à la main). **Test d'acceptation réussi** : bouton « masquer le système » retire tout le WebGL, le Hero reste complet. Point à corriger avant version finale : contraindre le halo pour qu'il ne frôle jamais les lettres en rotation. **Constat honnête** : 29 nœuds ne suffisent pas à épeler littéralement le nom (il en faudrait des centaines) — la formation du nom par particules, si souhaitée, demanderait une couche décorative distincte des nœuds réels (§04.1), non construite ici. Budget mesuré mis à jour : texte 172 Ko + 3D 234 Ko + polices 94 Ko ≈ **500 Ko** au premier chargement du Hero réel. |
| 2026-09-05 | v4.16 | **Hero corrigé et validé structurellement (§08.1).** Contrainte de composition actée : « le système encadre le nom, il ne le concurrence jamais » — résolue spatialement (halo décalé dans une zone dédiée, rayons compactés, rotation à 360° remplacée par une oscillation bornée ~±12°) plutôt qu'en z-index. Décision actée : pas de couche de particules décoratives pour épeler littéralement le nom — 29 nœuds réels ne suffiraient pas à le faire lisiblement, et une couche séparée romprait le principe « le système montré est le système réel ». Le Hero est considéré clos ; prochaine étape : prototype visuel du Data DNA en page à part entière. |
| 2026-09-05 | v4.17 | **Prototype visuel du Data DNA construit, testé et validé (§04.8).** Rendu 2D SVG sur `/data-dna`, distinct du halo 3D du Hero — mêmes données, deux niveaux de lecture (Hero = atmosphère, page = information). **Protocole assumé : les 4 piliers ne sont pas ancrés**, les positions sortent d'une simulation de forces déterministe qui ne connaît que les arêtes — ancrer les piliers aurait garanti un « oui » à la question 4 du test. **Résultat le plus important : les 4 piliers n'apparaissent PAS comme quatre zones comparables.** `AI` + `DATA` + `AUTOMATION` se superposent au barycentre ; seul `ML` se détache, parce qu'il est périphérique (1 projet de 2023 `lost`, 1 compétence, 1 librairie). **L'asymétrie se conserve, elle ne se corrige pas** : le profil est un noyau Data/Python/Automation/AI fortement interconnecté avec un axe ML spécialisé — plus mémorable pour un recruteur technique qu'un graphe équilibré. Autres résultats : **le centre de gravité est `Python`** (7/7 projets et expériences), pas « AI » ; `Job Agent` domine côté projets (15 relations / poids 38). **D-15 et D-16 résolus.** État canonique fixé : **dataset source 29/60 → graphe narratif 27/53**, dérivé par calcul (`deriveNarrativeGraph`) et non par une liste codée en dur. Deux retraits par resserrement : **`BUILD`** (sortie tautologique, `produces` poids 1 depuis les 7 projets — reste un concept éditorial du site) et le **calque « territoires de cluster »** (il dessinait quatre enveloppes de même traitement et invitait donc à chercher quatre zones comparables : exactement la manipulation que le protocole évite). `power-bi` sort du graphe par calcul et **sans être signalé au visiteur**. **Le niveau C est ce qui donne sa valeur au Data DNA** — A n'a pas à être aussi lisible que C. Sémantique d'arête rendue perceptible à la sélection (`feeds` plein / `uses` pointillé, panneau groupé par nature et sens, poids réel affiché tel quel) ; **la nuance « utilisé dans » vs « structure » n'a pas été ajoutée car elle n'existe pas dans `edges.json`** — `job-agent → python` et `job-agent → agentic-ai` y sont la même arête (`uses`, poids 3). |
