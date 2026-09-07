// Test de non-régression du Data DNA. Aucune dépendance : `node --experimental-strip-types`.
//
// Verrouille l'état canonique acté le 2026-09-05 (§04.7), resserré le
// 2026-09-07 par le retrait complet du ML — pilier, compétences, et le projet
// Churn Prediction, qui n'avait ni instantané de données ni recul écrit :
//   dataset source   21 nœuds / 42 arêtes
//   graphe narratif  19 nœuds / 36 arêtes
//
// Retrait du 2026-09-07 (suite) : `api-mistral` et `api-gemini`. Quel
// fournisseur de LLM sert de moteur est une dépendance technique incidente au
// sens de §04.7 — elle reste écrite dans la `stack` et la prose des pages
// projet, elle n'est pas une arête. `api-mistral` avait de surcroît un
// voisinage strictement inclus dans celui de `llm`, et `api-gemini` un
// voisinage réduit à un seul projet : les deux cercles ne connectaient rien
// que `llm` ne connectait déjà. `ia-llm` est renommé `llm` (« IA / LLM » →
// « LLM ») : « IA » et « LLM » dans le même intitulé disaient deux fois la
// même chose.
//
// Retrait du 2026-09-07 (fin) : `automation-skill` et `data-engineering`.
// RÈGLE : une compétence ne peut pas être un synonyme de son pilier — elle
// doit nommer un outil ou une technique, pas redire le domaine.
// « Automation » sous le pilier « AUTOMATION » était le même mot, avec un
// voisinage strictement inclus dans celui du pilier : le cercle disait moins
// que son pilier, sous la même étiquette. « Data Engineering » sous « DATA »
// est le même défaut, une case moins voyant — et les deux compétences avaient
// entre elles un voisinage identique, donc deux cercles indiscernables.
// `python` et `llm` ont eux aussi le voisinage de leur pilier, et sont
// CONSERVÉS : ils nomment un outil et une technique, pas le domaine, et la
// coïncidence y est un fait vrai (tous les projets IA sont des projets LLM ;
// Python est dans les 6 systèmes) — c'est l'insight, pas la redondance.
//
// Si l'un de ces nombres bouge sans décision explicite, le build doit crier.

import { readFileSync } from "node:fs";
import { deriveNarrativeGraph } from "../lib/data-dna/derive.ts";
import { buildIndexModel } from "../lib/data-dna/index-model.ts";
import { computeLayout } from "../lib/data-dna/layout-3d.ts";
import { deriveProjects, GALLERY_TAGS } from "../lib/laboratoire/derive.ts";
import { deriveExperiences } from "../lib/parcours/derive.ts";
import { channels, cvPdf } from "../lib/identity.ts";
import { aggregate, margin95, TIER_STEP } from "../lib/univers/aram/engine.ts";
import { sortedSources, type Snapshot as AiWatchSnapshot } from "../lib/univers/ai-watch/engine.ts";
import { formatDistance, type Snapshot as JobAgentSnapshot } from "../lib/univers/job-agent/engine.ts";
import {
  DOC_TOKENS,
  MODEL_LIMIT,
  DEGRADATION_ZONE,
  RATIO_ACTUEL,
  projeterTokens,
  estDansZoneDeDegradation,
  pourcentageDeLaLimite,
} from "../lib/univers/commission-bot/engine.ts";
import experienceActions from "../content/parcours/actions.ts";
import jobAgentContent from "../content/laboratoire/job-agent.ts";
import aramStatsContent from "../content/laboratoire/aram-stats.ts";
import commissionBotContent from "../content/laboratoire/commission-bot.ts";
import aiWatchContent from "../content/laboratoire/ai-watch.ts";
import type { DNAEdge, DNANode } from "../lib/data-dna/types.ts";

// Lecture par fs plutot qu'import JSON : le script doit tourner sous Node nu,
// sans bundler et sans attribut d'import. Ce sont les MEMES fichiers que ceux
// importes statiquement par lib/data-dna/source.ts.
const read = <T,>(f: string): T =>
  JSON.parse(readFileSync(new URL(f, import.meta.url), "utf8")) as T;
const sourceNodes = read<DNANode[]>("../data/nodes.json");
const sourceEdges = read<DNAEdge[]>("../data/edges.json");
const narrativeGraph = deriveNarrativeGraph(sourceNodes, sourceEdges);

let failed = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failed++;
  console.log(
    `${ok ? "  OK  " : " FAIL "} ${label.padEnd(52)} ${JSON.stringify(actual)}${
      ok ? "" : `  (attendu ${JSON.stringify(expected)})`
    }`
  );
}

console.log("\n— Dataset source (data/*.json, inchangé) —");
check("nœuds source", sourceNodes.length, 21);
check("arêtes source", sourceEdges.length, 42);

console.log("\n— Graphe narratif (dérivé, canonique) —");
check("nœuds narratifs", narrativeGraph.nodes.length, 19);
check("arêtes narratives", narrativeGraph.edges.length, 36);
check(
  "BUILD absent",
  narrativeGraph.nodes.some((n) => n.id === "build"),
  false
);
check(
  "Power BI absent",
  narrativeGraph.nodes.some((n) => n.id === "power-bi"),
  false
);
check(
  "kinds restants",
  [...new Set(narrativeGraph.edges.map((e) => e.kind))].sort(),
  ["feeds", "uses"]
);
check(
  "aucune arête orpheline",
  narrativeGraph.edges.filter(
    (e) =>
      !narrativeGraph.nodes.some((n) => n.id === e.from) ||
      !narrativeGraph.nodes.some((n) => n.id === e.to)
  ).length,
  0
);
check(
  "aucun nœud isolé",
  narrativeGraph.nodes.filter(
    (n) => !narrativeGraph.edges.some((e) => e.from === n.id || e.to === n.id)
  ).length,
  0
);

console.log("\n— Index (dérivé, aucun chiffre codé en dur) —");
const model = buildIndexModel(narrativeGraph);
check("clusters", model.clusters.map((c) => c.label), [
  "AI",
  "AUTOMATION",
  "DATA",
]);
check("systèmes (expérimentations + expériences)", model.systemCount, 6);
check("compétence la plus partagée", model.mostShared?.label, "Python");
check(
  "…utilisée par N systèmes",
  model.mostShared?.usedByCount,
  model.systemCount
);
check("…touche les 3 piliers", model.mostShared?.pillars.length, 3);
check(
  "toute compétence affichée a au moins un usage",
  model.clusters.every((c) => c.capabilities.every((k) => k.usedBy.length > 0)),
  true
);

console.log("\n— Halo du HERO (layout 3D, memes donnees que PROFIL) —");
const halo = computeLayout(narrativeGraph.nodes, narrativeGraph.edges);
check("noeuds places dans le halo", halo.length, narrativeGraph.nodes.length);
check(
  "aucun noeud `core` (BUILD etait le seul `output`)",
  halo.some((n) => n.ring === "core"),
  false
);
check(
  "BUILD / Power BI absents du halo",
  halo.some((n) => n.id === "build" || n.id === "power-bi"),
  false
);
check(
  "positions finies (aucun NaN)",
  halo.every((n) => n.position.every(Number.isFinite)),
  true
);

console.log("\n— Laboratoire (4 expérimentations, §08.4 / §09.5) —");
const projects = deriveProjects(sourceNodes);
check("projets", projects.length, 4);
check(
  "slugs et numérotation",
  projects.map((p) => `${p.number} ${p.slug}`),
  [
    "01 job-agent",
    "02 aram-stats",
    "03 commission-bot",
    "04 ai-watch",
  ]
);
check(
  "chaque projet a friction, métrique et niveau de preuve",
  projects.every((p) => !!p.friction && !!p.metric && !!p.proofLevel),
  true
);
check(
  "chaque projet a ses tags §08.4",
  projects.every((p) => p.tags.length > 0),
  true
);
check(
  "aucun tag orphelin (tout slug déclaré existe)",
  Object.keys(GALLERY_TAGS).filter(
    (slug) => !projects.some((p) => p.slug === slug)
  ),
  []
);
check(
  "six sections §09.2 dans l'ordre",
  projects.every(
    (p) =>
      p.sections.map((s) => s.label).join("/") ===
      "Friction/Construction/Système/Données/Résultat/Recul"
  ),
  true
);
// Job Agent est le premier projet dont les six sections sont rédigées. Le
// contenu vit dans content/, la structure dans data/ — ce contrôle vérifie que
// les deux se rejoignent bien sur les six clés du §09.2.
const jobAgent = deriveProjects(sourceNodes, { "job-agent": jobAgentContent }).find(
  (p) => p.slug === "job-agent"
);
check(
  "Job Agent — six sections rédigées, aucune vide",
  jobAgent?.sections.filter((s) => s.paragraphs.length === 0).length,
  0
);
check(
  "Job Agent — chaîne du pipeline en 03, stack en 04",
  [!!jobAgent?.sections[2].chain, !!jobAgent?.sections[3].stack],
  [true, true]
);
// Les quatre autres projets : 02 CONSTRUCTION et 04 DONNÉES sont rédigées,
// 06 RECUL reste délibérément vide — sa matière n'existe dans aucune source.
// Même liaison contenu + graphe que lib/laboratoire/source.ts, reconstruite ici
// parce que ce script tourne sous Node nu, sans alias de bundler.
const written = deriveProjects(sourceNodes, {
  "job-agent": jobAgentContent,
  "aram-stats": aramStatsContent,
  "commission-bot": commissionBotContent,
  "ai-watch": aiWatchContent,
});
check(
  "Les 3 autres — 02 et 04 rédigées",
  written
    .filter((p) => p.slug !== "job-agent")
    .every((p) => p.sections[1].paragraphs.length > 0 && p.sections[3].paragraphs.length > 0),
  true
);
// Plus aucune section vide nulle part : les quatre pages projet sont rédigées.
check(
  "Aucune section vide sur les 4 projets",
  written.reduce((n, p) => n + p.sections.filter((s) => s.paragraphs.length === 0).length, 0),
  0
);
check(
  "06 RECUL rédigé pour ARAM, Commission Bot et AI Watch",
  ["aram-stats", "commission-bot", "ai-watch"].every(
    (slug) => (written.find((p) => p.slug === slug)?.sections[5].paragraphs.length ?? 0) >= 9
  ),
  true
);
// 03 SYSTÈME doit expliquer le fonctionnement, pas résumer 02 : chaque projet
// porte désormais une représentation propre du système (chaîne + mécanique).
check(
  "03 Système — chaîne spécifique sur les 5 projets",
  written.every((p) => (p.sections[2].chain?.length ?? 0) >= 5),
  true
);
// 05 RÉSULTAT ne doit plus recopier le grand chiffre du badge : on vérifie que
// la section ne commence pas par la valeur de la métrique.
check(
  "05 Résultat — ne redit pas le badge",
  written.every(
    (p) => !(p.sections[4].paragraphs[0] ?? "").startsWith(p.metric?.value ?? "@@")
  ),
  true
);
check(
  "Parcours — colonne d'action à la première personne",
  Object.values(experienceActions)
    .flat()
    .every((t) => !t.includes("Rayan")),
  true
);
check("CV — PDF servi", cvPdf, "/CV_Rayan_Jemai_2026.pdf");
check(
  "Contact — 3 canaux tous cliquables",
  channels.map((c) => c.href.startsWith("mailto:") || c.href.startsWith("https://")),
  [true, true, true]
);
// Positionnement public (décision du 2026-09-06, resserré le 2026-09-07) :
// `Data Scientist · AI Builder`. L'assurance ne peut apparaître que comme CONTEXTE d'un projet ou
// d'une expérience — jamais comme spécialisation. Ce contrôle garde la porte
// fermée sur le vocabulaire actuariel, retiré du site.
check(
  "Aucun vocabulaire actuariel dans les textes rendus",
  [...written.flatMap((p) => p.sections.flatMap((s) => s.paragraphs)),
   ...Object.values(experienceActions).flat()].some((t) => /actuari/i.test(t)),
  false
);
// --- Univers ARAM (D-17 : instantané figé et daté) ---
//
// Le moteur est pur : il se contrôle sans navigateur, sur une fausse table
// construite ici. Ce qu'on vérifie n'est pas l'affichage, c'est la SEULE
// chose qui pourrait mentir au visiteur : la frontière du tranchable.
//
// Le chiffre publié en §06 de la page : un augment à ~10 000 picks donne
// « ±1 point », quand les paliers de tier valent 1,5. Si la formule dérivait,
// la page afficherait « tranchable » sur des lignes qui ne tranchent rien.
check(
  "ARAM — 10 000 picks donnent bien ±1 point",
  Math.round(margin95(5000, 10000) * 100) / 100,
  0.98
);
check(
  "ARAM — le seuil de décidabilité est le palier de tier",
  TIER_STEP,
  1.5
);
// Une ligne à faible échantillon ne doit JAMAIS ressortir tranchable.
const fakeSnapshot = {
  patch: "test",
  bytes: 0,
  tables: {
    augment: {
      rows: 2,
      columns: {
        id: new Uint16Array([0, 1]),
        n: new Uint32Array([10000, 120]),
        wins: new Uint32Array([5000, 70]),
      },
    },
  },
};
const aggregated = aggregate(fakeSnapshot, {
  view: "augment",
  champion: null,
  minSample: 0,
});
// Le défaut que Wilson corrige : 6 parties, 6 victoires. L'intervalle usuel
// rendait ± 0,00 — la ligne la plus incertaine du tableau annoncée comme la
// plus sûre. Ce contrôle interdit le retour de ce mensonge.
check(
  "ARAM — 6 victoires sur 6 n'est pas une certitude",
  margin95(6, 6) > 10,
  true
);
check(
  "ARAM — le petit échantillon n'est pas tranchable",
  aggregated.rows.map((r) => r.decidable),
  [false, true]
);
check("ARAM — lignes parcourues = lignes de la table", aggregated.scanned, 2);

check(
  "Power BI absent du laboratoire",
  projects.some((p) => p.slug === "power-bi"),
  false
);

console.log("\n— Parcours (2 expériences, §08.5) —");
const experiences = deriveExperiences(narrativeGraph.nodes, narrativeGraph.edges);
check("expériences", experiences.map((x) => x.id), ["exp-commissions", "exp-sas-python"]);
check(
  "compétences dérivées des arêtes `uses`, poids décroissant",
  experiences.map((x) => x.capabilities.map((c) => `${c.label} ${c.weight}`)),
  [
    ["Python 3", "LLM 2"],
    ["Python 3", "SAS 3"],
  ]
);
check(
  "piliers alimentés",
  experiences.map((x) => x.pillars),
  [
    ["AI", "AUTOMATION"],
    ["AUTOMATION", "DATA"],
  ]
);
check(
  "chaque expérience a friction, système, métrique et résultat",
  experiences.every((x) => !!x.friction && !!x.system && !!x.metric && !!x.result),
  true
);
check(
  "compétences partagées avec le laboratoire",
  experiences.map((x) => x.sharedWith.map((p) => `${p.slug} ${p.shared}`)),
  [
    ["job-agent 2", "commission-bot 2", "ai-watch 2", "aram-stats 1"],
    ["job-agent 1", "aram-stats 1", "commission-bot 1", "ai-watch 1"],
  ]
);
check(
  "BUILD absent du parcours",
  experiences.some(
    (x) => x.pillars.includes("BUILD") || x.capabilities.some((c) => c.id === "build")
  ),
  false
);

console.log("\n— Univers AI Watch (snapshot figé, D-17) —");
const aiWatchSnapshot = read<AiWatchSnapshot>(
  "../public/univers/ai-watch/ai-watch-2026-08-22.json"
);

check("AI Watch — fenêtre", [aiWatchSnapshot.meta.fenetre_debut, aiWatchSnapshot.meta.fenetre_fin, aiWatchSnapshot.meta.fenetre_jours], ["2026-08-04", "2026-08-22", 19]);
check("AI Watch — 34 sources déclarées", aiWatchSnapshot.meta.sources_declarees, 34);
check("AI Watch — 27 présentes / 7 sans item", [aiWatchSnapshot.meta.sources_presentes, aiWatchSnapshot.meta.sources_sans_item], [27, 7]);
check("AI Watch — 34 lignes dans le snapshot", aiWatchSnapshot.sources.length, 34);
check("AI Watch — totaux 1 101 / 383", [aiWatchSnapshot.totaux.items, aiWatchSnapshot.totaux.utiles], [1101, 383]);
check("AI Watch — sous-ensemble coupé 287 / 19", [aiWatchSnapshot.sous_ensemble_coupe.items, aiWatchSnapshot.sous_ensemble_coupe.utiles], [287, 19]);

const byVolume = sortedSources(aiWatchSnapshot.sources, "volume");
const byRendement = sortedSources(aiWatchSnapshot.sources, "rendement");
check(
  "AI Watch — les 7 sources sans item restent en fin de classement, dans les deux modes",
  [byVolume.slice(-7).every((s) => s.items === 0), byRendement.slice(-7).every((s) => s.items === 0)],
  [true, true]
);
check(
  "AI Watch — tri par volume strictement décroissant sur les sources présentes",
  byVolume.slice(0, 27).every((s, i, arr) => i === 0 || arr[i - 1].items >= s.items),
  true
);
check(
  "AI Watch — tri par rendement strictement décroissant sur les sources présentes",
  byRendement.slice(0, 27).every((s, i, arr) => i === 0 || (arr[i - 1].rendement ?? 0) >= (s.rendement ?? 0)),
  true
);
check(
  "AI Watch — une grosse source à faible rendement descend du mode volume au mode rendement",
  byVolume.findIndex((s) => s.id === "next_ink") < byRendement.findIndex((s) => s.id === "next_ink"),
  true
);
check(
  "AI Watch — une petite source à haut rendement remonte du mode volume au mode rendement",
  byVolume.findIndex((s) => s.id === "anthropic") > byRendement.findIndex((s) => s.id === "anthropic"),
  true
);

console.log("\n— Univers Job Agent (traces réelles, offre 24, D-17) —");
const jobAgentSnapshot = read<JobAgentSnapshot>(
  "../public/univers/job-agent/job-agent-trace-24.json"
);

check(
  "Job Agent — composite 10/10/0",
  [
    jobAgentSnapshot.composite.requirements,
    jobAgentSnapshot.composite.retenues,
    jobAgentSnapshot.composite.signaux,
  ],
  [10, 10, 0]
);
check(
  "Job Agent — atomique 63/62/1",
  [
    jobAgentSnapshot.atomique.atomes,
    jobAgentSnapshot.atomique.retenus,
    jobAgentSnapshot.atomique.signaux,
  ],
  [63, 62, 1]
);
check(
  "Job Agent — texte QMS identique entre composite et atomique",
  jobAgentSnapshot.composite.items.some(
    (i) => i.texte === jobAgentSnapshot.atomique.qms.texte
  ),
  true
);
check("Job Agent — QMS décomposée en 7 atomes", jobAgentSnapshot.atomique.qms.atomes.length, 7);
const isoAtom = jobAgentSnapshot.atomique.qms.atomes.find((a) => a.label === "ISO 13485");
check("Job Agent — ISO 13485, distance brute 0,7625", isoAtom?.distance, 0.7625);
check("Job Agent — ISO 13485 affichée à 0,763 (arrondi .5 vers le haut)", formatDistance(isoAtom?.distance ?? null), "0,763");
check("Job Agent — ISO 13485 porte le seul signal", isoAtom?.verdict, "flag_uncertain");
check(
  "Job Agent — un seul flag_uncertain dans toute la décomposition QMS",
  jobAgentSnapshot.atomique.qms.atomes.filter((a) => a.verdict === "flag_uncertain").length,
  1
);
check(
  "Job Agent — aucun score global (pas de champ score/note/pourcentage à la racine)",
  Object.keys(jobAgentSnapshot).sort(),
  ["atomique", "composite", "meta"]
);

console.log("\n— Univers Commission Bot (constantes éditoriales, aucune mesure) —");
check("Commission Bot — documentation actuelle", DOC_TOKENS, 22_000);
check("Commission Bot — limite du modèle", MODEL_LIMIT, 128_000);
check("Commission Bot — zone de dégradation", [DEGRADATION_ZONE.min, DEGRADATION_ZONE.max], [40_000, 60_000]);
check("Commission Bot — ratio actuel = 17 %", Math.round(RATIO_ACTUEL * 100), 17);
check("Commission Bot — ×1/×2/×3 = 22k/44k/66k", [1, 2, 3].map((m) => projeterTokens(m as 1 | 2 | 3)), [22_000, 44_000, 66_000]);
check("Commission Bot — ×1 hors zone de dégradation", estDansZoneDeDegradation(projeterTokens(1)), false);
check("Commission Bot — ×2 entre dans la zone de dégradation", estDansZoneDeDegradation(projeterTokens(2)), true);
check("Commission Bot — ×3 ressort de la zone de dégradation", estDansZoneDeDegradation(projeterTokens(3)), false);
check("Commission Bot — pourcentage de la limite à ×1 = 17 %", Math.round(pourcentageDeLaLimite(projeterTokens(1))), 17);

console.log(
  failed === 0
    ? "\nTous les contrôles passent.\n"
    : `\n${failed} contrôle(s) en échec.\n`
);
process.exit(failed === 0 ? 0 : 1);
