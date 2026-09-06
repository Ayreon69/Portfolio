"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  deriveNarrativeGraph,
  layoutGraph,
  VIEWBOX,
  type DNAEdge,
  type DNANode,
  type Exclusion,
  type LaidOutGraph,
  type LaidOutNode,
} from "@/lib/graph-layout";

/* ------------------------------------------------------------------ *
 * Prototype visuel du Data DNA — page, pas Hero.
 *
 * Ce qu'on teste ici, et rien d'autre :
 *   1. Où est le centre de gravité du profil ?
 *   2. Quels sont les projets ?
 *   3. Quelles compétences les relient ?
 *   4. Est-ce que les 4 piliers apparaissent naturellement ?
 *   5. Comprend-on quelque chose de plus qu'avec une liste de compétences ?
 *
 * Contraintes du prototype :
 *   - 29 nœuds / 60 arêtes réels. Aucune donnée ajoutée pour "remplir".
 *   - Aucune position choisie à la main (voir lib/graph-layout.ts).
 *   - Aucun accent projet : la règle du design system (§03.3) réserve les 5
 *     accents aux pages projet. Toute la hiérarchie passe donc par la forme,
 *     la taille et la valeur — pas par la couleur.
 * ------------------------------------------------------------------ */

const INK = "#1A1A18";
const CREAM = "#F4EFE4";
const WARM = "#8A7F6A";
const MUTED = "#55534C";

type Level = "A" | "B" | "C";

/** Ordre de peinture : ce qui structure la lecture passe par-dessus. Déclaré
 *  avant le composant — un `const` module placé après lui reste dans la zone
 *  morte temporelle pour certains ordres d'évaluation du bundle client, ce qui
 *  casse l'hydratation sans casser le rendu serveur (page affichée, boutons
 *  inertes). */
const LAYERS: LaidOutNode["type"][][] = [
  ["capability"],
  ["experiment", "experience"],
  ["pillar", "output"],
];

const CLUSTER_LABEL: Record<string, string> = {
  ai: "AI",
  ml: "ML",
  automation: "AUTOMATION",
  data: "DATA",
};

type Derived = {
  graph: LaidOutGraph;
  source: { nodes: number; edges: number };
  excluded: Exclusion[];
};

function useGraph(): Derived | null {
  const [raw, setRaw] = useState<{
    nodes: DNANode[];
    edges: DNAEdge[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/data/nodes.json").then((r) => r.json()),
      fetch("/data/edges.json").then((r) => r.json()),
    ]).then(([nodes, edges]) => {
      if (!cancelled) setRaw({ nodes, edges });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Le layout ne tourne qu'une fois. Changer de niveau A/B/C ne redistribue
  // jamais le graphe : sinon on comparerait deux compositions différentes au
  // lieu de deux représentations des mêmes données.
  return useMemo(() => {
    if (!raw) return null;
    const { nodes, edges, excluded } = deriveNarrativeGraph(raw.nodes, raw.edges);
    return {
      graph: layoutGraph(nodes, edges),
      source: { nodes: raw.nodes.length, edges: raw.edges.length },
      excluded,
    };
  }, [raw]);
}

function nodeRadius(n: LaidOutNode, level: Level): number {
  if (level === "A") return 4;
  switch (n.type) {
    case "output":
      return 16;
    case "pillar":
      return 11 + n.weightedDegree * 0.55;
    case "experiment":
    case "experience":
      return 7 + n.weightedDegree * 0.32;
    default:
      return 3 + n.weightedDegree * 0.5;
  }
}

export default function DataDNAPage() {
  const derived = useGraph();
  const graph = derived?.graph ?? null;
  const [level, setLevel] = useState<Level>("A");
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);

  const active = pinned ?? hovered;
  const interactive = level === "C";

  useEffect(() => {
    if (!interactive) {
      setHovered(null);
      setPinned(null);
    }
  }, [interactive]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPinned(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const labels = useMemo(
    () => (graph ? placeLabels(graph.nodes, level) : new Map()),
    [graph, level]
  );

  /**
   * Ou poser le panneau de detail, et jusqu'a quelle largeur.
   *
   * Mesure sur la geometrie REELLE deja calculee (noeuds + boites de labels,
   * memes heuristiques que placeLabels) la bande peripherique libre a gauche et
   * a droite du nuage, puis retient la plus large. Le panneau est ensuite borne
   * a cette bande.
   *
   * Consequence : le panneau ne peut pas recouvrir un noeud, quelle que soit la
   * largeur du viewport — et il se replacera tout seul si la topologie change
   * un jour. C'est le panneau qui s'adapte au graphe ; jamais l'inverse. Aucun
   * noeud n'est deplace, aucune echelle recalculee, aucun padding ajoute au
   * graphe pour "faire de la place".
   */
  const panelZone = useMemo(() => {
    if (!graph) return { side: "left" as const, maxPct: 22 };
    let minX = VIEWBOX.width;
    let maxX = 0;
    for (const n of graph.nodes) {
      const r = nodeRadius(n, level);
      minX = Math.min(minX, n.x - r);
      maxX = Math.max(maxX, n.x + r);
      const off = labels.get(n.id);
      if (!off) continue;
      const fs = labelFontSize(n);
      const w = n.display.length * fs * (isStructural(n) ? 0.72 : 0.55);
      const x = n.x + off.dx;
      const x0 =
        off.anchor === "middle" ? x - w / 2 : off.anchor === "start" ? x : x - w;
      minX = Math.min(minX, x0);
      maxX = Math.max(maxX, x0 + w);
    }
    const free = { left: Math.max(0, minX), right: Math.max(0, VIEWBOX.width - maxX) };
    const side = free.left >= free.right ? ("left" as const) : ("right" as const);
    // -3 % de marge : le panneau s'arrete avant de fleurter avec le nuage.
    const maxPct = Math.max(0, (free[side] / VIEWBOX.width) * 100 - 3);
    return { side, maxPct };
  }, [graph, labels, level]);

  const activeNode = active ? graph?.byId.get(active) ?? null : null;
  const activeNeighbors = active ? graph?.neighbors.get(active) : undefined;

  const isDimmed = (id: string) =>
    interactive &&
    !!active &&
    id !== active &&
    !(activeNeighbors?.has(id) ?? false);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: CREAM,
        color: INK,
        padding: "28px clamp(18px, 4vw, 56px) 64px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 20,
          flexWrap: "wrap",
          borderBottom: `1px solid ${WARM}55`,
          paddingBottom: 16,
        }}
      >
        <div>
          <p style={mono(11, MUTED)}>PROTOTYPE — NON INTÉGRÉ</p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(30px, 5vw, 52px)",
              margin: "6px 0 0",
              lineHeight: 1,
            }}
          >
            Data DNA
          </h1>
        </div>
        <p style={{ ...mono(11, MUTED), textAlign: "right", lineHeight: 1.7 }}>
          {graph ? `${graph.nodes.length} NŒUDS · ${graph.edges.length} ARÊTES` : "…"}
          <br />
          POSITIONS DÉRIVÉES DES ARÊTES, JAMAIS CHOISIES
          <br />
          <Link href="/" style={{ color: MUTED }}>
            ← retour au Hero
          </Link>
        </p>
      </header>

      {/* Le test reste sous les yeux pendant qu'on regarde le graphe. La page
          ne répond pas aux questions à la place du lecteur. */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px 26px",
          margin: "18px 0 22px",
        }}
      >
        {[
          "Où est le centre de gravité ?",
          "Quels sont les projets ?",
          "Quelles compétences les relient ?",
          "Les 4 piliers apparaissent-ils ?",
          "Comprend-on plus qu'avec une liste ?",
        ].map((q, i) => (
          <p key={q} style={{ ...mono(11, MUTED), margin: 0, lineHeight: 1.6 }}>
            <span style={{ color: INK }}>{String(i + 1).padStart(2, "0")}</span>{" "}
            {q}
          </p>
        ))}
      </section>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        {(
          [
            ["A", "A — TOPOLOGIE BRUTE"],
            ["B", "B — HIÉRARCHIE"],
            ["C", "C — INTERACTION"],
          ] as [Level, string][]
        ).map(([lv, label]) => (
          <button
            key={lv}
            type="button"
            onClick={() => setLevel(lv)}
            style={chip(level === lv)}
          >
            {label}
          </button>
        ))}
        {pinned && (
          <button type="button" onClick={() => setPinned(null)} style={chip(false)}>
            ← RETOUR (ÉCHAP)
          </button>
        )}
      </div>

      {/* Regle responsive du panneau. Sous 900 px, la bande peripherique libre
          (~29 % de la largeur) devient trop etroite pour rester lisible : le
          panneau sort alors de l'overlay et se place SOUS le canvas, en flux
          normal. Le SVG garde sa largeur (100 % du conteneur) et son viewBox :
          aucun reflow, aucun noeud deplace, aucune echelle modifiee — c'est le
          panneau qui change de place, pas le graphe. */}
      <style>{`
        /* Sans ceci, ouvrir le panneau allonge la page, fait APPARAITRE la
           barre de defilement, retrecit le viewport de ~15 px, donc le SVG en
           width:100%, donc l'echelle de tout le graphe. Reserver la gouttiere
           en permanence rend la geometrie du graphe insensible a la hauteur du
           contenu : c'est la condition sine qua non de la regle "le panneau ne
           modifie jamais la geometrie du graphe". */
        html { scrollbar-gutter: stable; }

        @media (max-width: 900px) {
          .dna-panel {
            position: static !important;
            width: auto !important;
            max-height: none !important;
            overflow-y: visible !important;
            margin-top: 14px;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Le panneau de détail se superpose à la zone vide du graphe au lieu de
          lui prendre de la largeur : passer de B à C ne doit jamais changer la
          taille ni les positions du graphe, sinon on comparerait deux
          compositions différentes. */}
      <div style={{ position: "relative" }}>
        <div
          style={{
            border: `1px solid ${WARM}55`,
            background: "#FAF7F0",
            position: "relative",
          }}
        >
          {!graph && (
            <p style={{ ...mono(11, MUTED), padding: 40, margin: 0 }}>
              chargement du graphe…
            </p>
          )}
          {graph && (
            <svg
              viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
              style={{ width: "100%", height: "auto", display: "block" }}
              onClick={() => interactive && setPinned(null)}
            >
              {/* Aucun calque de « territoires de cluster » : il dessinait
                  quatre enveloppes de même traitement et invitait donc à
                  chercher quatre zones comparables, alors que la donnée dit
                  l'inverse (AI + DATA + AUTOMATION enchevêtrés, ML périphérique).
                  L'instrument de test a répondu à la question 04 ; le garder
                  reviendrait à fabriquer l'asymétrie qu'on voulait éviter. */}
              {graph.edges.map((e, i) => {
                const a = graph.byId.get(e.from);
                const b = graph.byId.get(e.to);
                if (!a || !b) return null;
                const touchesActive =
                  !!active && (e.from === active || e.to === active);
                const dim = interactive && !!active && !touchesActive;
                return (
                  <line
                    key={i}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={touchesActive ? INK : WARM}
                    strokeWidth={
                      level === "A"
                        ? 0.7
                        : touchesActive
                          ? 0.5 + e.weight * 0.5
                          : 0.4 + e.weight * 0.32
                    }
                    strokeOpacity={dim ? 0.06 : touchesActive ? 0.75 : level === "A" ? 0.42 : 0.34}
                    // La nature de l'arête n'est rendue perceptible que sur la
                    // sélection : `feeds` en trait plein, `uses` en pointillé.
                    // L'encoder en permanence encombrerait 53 arêtes pour une
                    // information qu'on ne lit que nœud par nœud.
                    strokeDasharray={
                      touchesActive && e.kind === "uses" ? "3 3" : undefined
                    }
                  />
                );
              })}

              {/* Aucune bande « hors système » dans le canvas : le visiteur n'a
                  aucune raison d'apprendre qu'un nœud a été retiré. Le Data DNA
                  raconte le profil, pas les décisions de construction du Data
                  DNA. La dérivation est documentée dans le châssis du prototype,
                  sous le graphe. */}

              {/* Rendu en couches, du moins structurant au plus structurant :
                  compétences → projets → piliers. Un label de pilier ne doit
                  jamais passer sous un label de compétence — la hiérarchie de
                  lecture doit être vraie jusque dans l'ordre de peinture. */}
              {LAYERS.map((layer) => (
                <g key={`shapes-${layer.join()}`}>
                  {graph.nodes
                    .filter((n) => layer.includes(n.type))
                    .map((n) => {
                      const r = nodeRadius(n, level);
                      const dim = isDimmed(n.id);
                      const hollow =
                        level !== "A" &&
                        (n.type === "pillar" || n.type === "output");
                      const common = {
                        fill: hollow ? "#FAF7F0" : INK,
                        stroke: hollow ? INK : "none",
                        strokeWidth: hollow ? (n.type === "pillar" ? 2 : 1.2) : 0,
                        opacity: dim ? 0.12 : 1,
                      };
                      return (
                        <g
                          key={n.id}
                          data-node-id={n.id}
                          onMouseEnter={() => interactive && setHovered(n.id)}
                          onMouseLeave={() => interactive && setHovered(null)}
                          onClick={(ev) => {
                            if (!interactive) return;
                            ev.stopPropagation();
                            setPinned((p) => (p === n.id ? null : n.id));
                          }}
                          style={{ cursor: interactive ? "pointer" : "default" }}
                        >
                          {interactive && (
                            <circle
                              cx={n.x}
                              cy={n.y}
                              r={Math.max(r + 9, 14)}
                              fill="transparent"
                            />
                          )}
                          {n.id === active && (
                            <circle
                              cx={n.x}
                              cy={n.y}
                              r={r + 7}
                              fill="none"
                              stroke={INK}
                              strokeWidth={1}
                              strokeOpacity={0.5}
                            />
                          )}
                          {/* Expérience professionnelle = losange. Distinction
                              de forme, pas de couleur : « vécu en entreprise »
                              vs « construit en propre » doit se lire d'un coup
                              d'œil, sans légende. */}
                          {level !== "A" && n.type === "experience" ? (
                            <rect
                              x={n.x - r}
                              y={n.y - r}
                              width={r * 2}
                              height={r * 2}
                              transform={`rotate(45 ${n.x} ${n.y})`}
                              {...common}
                            />
                          ) : (
                            <circle cx={n.x} cy={n.y} r={r} {...common} />
                          )}
                        </g>
                      );
                    })}
                </g>
              ))}

              {level !== "A" &&
                LAYERS.map((layer) => (
                  <g key={`labels-${layer.join()}`} style={{ pointerEvents: "none" }}>
                    {graph.nodes
                      .filter((n) => layer.includes(n.type))
                      .map((n) => {
                        const off = labels.get(n.id) ?? {
                          dx: 0,
                          dy: nodeRadius(n, level) + 14,
                          anchor: "middle" as const,
                        };
                        const structural = isStructural(n);
                        return (
                          <text
                            key={n.id}
                            x={n.x + off.dx}
                            y={n.y + off.dy}
                            textAnchor={off.anchor}
                            style={{
                              fontFamily: structural
                                ? "var(--font-mono)"
                                : "var(--font-sans)",
                              fontSize: labelFontSize(n),
                              fontWeight:
                                n.type === "experiment" || n.type === "experience"
                                  ? 600
                                  : 500,
                              letterSpacing: structural ? "0.14em" : "0.01em",
                              fill: n.type === "capability" ? MUTED : INK,
                              opacity: isDimmed(n.id) ? 0.1 : 1,
                              paintOrder: "stroke",
                              stroke: "#FAF7F0",
                              strokeWidth: structural ? 5 : 3.5,
                              strokeLinejoin: "round",
                            }}
                          >
                            {n.display}
                          </text>
                        );
                      })}
                  </g>
                ))}
            </svg>
          )}
        </div>

        {interactive && (
          <aside
            className="dna-panel"
            style={{
              position: "absolute",
              top: 12,
              left: panelZone.side === "left" ? 12 : undefined,
              right: panelZone.side === "right" ? 12 : undefined,
              // Largeur bornee par la bande peripherique reellement libre
              // (panelZone.maxPct), mesuree sur la geometrie du graphe. Le
              // panneau ne peut donc pas mordre sur un noeud, quelle que soit
              // la largeur du viewport.
              width: `clamp(196px, ${panelZone.maxPct.toFixed(1)}%, 268px)`,
              maxHeight: "calc(100% - 24px)",
              overflowY: "auto",
              border: `1px solid ${WARM}77`,
              padding: "14px 15px 18px",
              background: "#FAF7F0",
              boxShadow: "0 1px 12px rgba(26,26,24,0.06)",
            }}
          >
            {!activeNode && (
              <p style={{ ...mono(11, MUTED), margin: 0, lineHeight: 1.8 }}>
                SURVOLER UN NŒUD POUR ISOLER SES RELATIONS.
                <br />
                CLIQUER POUR FIGER. ÉCHAP POUR REVENIR.
              </p>
            )}
            {activeNode && graph && (
              <>
                <p style={mono(10, MUTED)}>
                  {activeNode.type.toUpperCase()}
                  {activeNode.cluster
                    ? ` · ${CLUSTER_LABEL[activeNode.cluster]}`
                    : ""}
                </p>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 22,
                    margin: "4px 0 12px",
                    lineHeight: 1.15,
                  }}
                >
                  {activeNode.display}
                </h2>
                <p style={mono(10, MUTED)}>
                  {activeNode.degree} RELATION{activeNode.degree > 1 ? "S" : ""} ·
                  POIDS CUMULÉ {activeNode.weightedDegree}
                </p>

                {/* Groupé par nature d'arête, du point de vue du nœud
                    sélectionné. Ces quatre intitulés sont la traduction directe
                    de (kind, sens) tel qu'il existe dans edges.json — aucune
                    nuance ajoutée : `Job Agent → Python` et
                    `Job Agent → Agentic AI` sont la MÊME arête dans les données
                    (uses, poids 3), donc elles se lisent pareil ici. */}
                {relationGroups(activeNode, graph).map((g) => (
                  <div key={g.title} style={{ marginTop: 14 }}>
                    <p style={mono(9, INK)}>
                      {g.title} <span style={{ color: MUTED }}>({g.items.length})</span>
                    </p>
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: "6px 0 0",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      {g.items.map((it) => (
                        <li
                          key={it.id}
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: 12,
                            lineHeight: 1.45,
                            display: "flex",
                            alignItems: "baseline",
                            justifyContent: "space-between",
                            gap: 10,
                          }}
                        >
                          <span>{it.label}</span>
                          <WeightBar weight={it.weight} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </>
            )}
          </aside>
        )}
      </div>

      <footer
        style={{
          marginTop: 22,
          borderTop: `1px solid ${WARM}55`,
          paddingTop: 14,
          display: "flex",
          gap: "10px 34px",
          flexWrap: "wrap",
        }}
      >
        {level === "A" ? (
          <p style={{ ...mono(11, MUTED), margin: 0, maxWidth: 660, lineHeight: 1.7 }}>
            NIVEAU A — TOUS LES NŒUDS IDENTIQUES, TOUTES LES ARÊTES IDENTIQUES.
            AUCUNE HIÉRARCHIE, AUCUN LABEL. ON NE REGARDE QUE LA FORME QUE LES
            ARÊTES PRODUISENT D&apos;ELLES-MÊMES. A N&apos;A PAS À ÊTRE AUSSI
            LISIBLE QUE C : SON RÔLE EST DE MONTRER LA STRUCTURE RÉELLE, PAS DE
            LA COMMENTER.
          </p>
        ) : (
          <>
            <Legend swatch={<Dot r={9} hollow strokeWidth={2} />} text="PILIER" />
            <Legend swatch={<Dot r={7} />} text="PROJET" />
            <Legend swatch={<Diamond r={7} />} text="EXPÉRIENCE PRO" />
            <Legend swatch={<Dot r={4} />} text="COMPÉTENCE" />
            {level === "C" && (
              <>
                <Legend swatch={<Rule />} text="ALIMENTE (FEEDS)" />
                <Legend swatch={<Rule dashed />} text="UTILISE (USES)" />
              </>
            )}
            <p style={{ ...mono(10, MUTED), margin: 0, width: "100%", lineHeight: 1.7 }}>
              TAILLE = POIDS CUMULÉ RÉEL DES ARÊTES. ÉPAISSEUR DE TRAIT = POIDS DE
              L&apos;ARÊTE. AUCUNE COULEUR D&apos;ACCENT : ELLES SONT RÉSERVÉES AUX
              PAGES PROJET (§03.3).
            </p>
          </>
        )}
        {derived && (
          <p
            style={{
              ...mono(10, MUTED),
              margin: 0,
              width: "100%",
              lineHeight: 1.7,
              borderLeft: `2px solid ${WARM}`,
              paddingLeft: 10,
            }}
          >
            DIAGNOSTIC DE PROTOTYPE, PAS UN ÉLÉMENT D&apos;INTERFACE — DATASET
            SOURCE {derived.source.nodes} · {derived.source.edges} → GRAPHE
            NARRATIF {derived.graph.nodes.length} · {derived.graph.edges.length}.
            RETIRÉ :{" "}
            {derived.excluded.map((e) => `${e.label} (${e.reason})`).join(" · ")}.
          </p>
        )}
      </footer>
    </main>
  );
}

/* ---------------------------- helpers de rendu ---------------------------- */

export function labelFontSize(n: LaidOutNode): number {
  if (n.type === "pillar") return 14;
  if (n.type === "output") return 11;
  if (n.type === "capability") return 9.5;
  return 12.5;
}

function isStructural(n: LaidOutNode) {
  return n.type === "pillar" || n.type === "output";
}

type Box = { x0: number; y0: number; x1: number; y1: number };
const overlaps = (a: Box, b: Box) =>
  a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

/**
 * Placement des étiquettes par évitement de collision.
 *
 * Le cœur du graphe est dense — c'est un fait structurel du profil, pas un
 * défaut à corriger en déplaçant les nœuds. Mais des étiquettes qui se
 * chevauchent, elles, sont un défaut de rendu : elles feraient juger le
 * placement du texte au lieu de la structure. On ne bouge donc jamais un nœud ;
 * on choisit, pour chaque label, la position la moins encombrée parmi quatre,
 * en traitant d'abord les nœuds les plus structurants (ils gagnent la place).
 */
function placeLabels(nodes: LaidOutNode[], level: Level) {
  const rank = (n: LaidOutNode) =>
    n.type === "pillar" ? 0 : n.type === "output" ? 1 : n.type === "capability" ? 3 : 2;

  // Les nœuds eux-mêmes sont des obstacles : un label ne doit jamais recouvrir
  // un disque, même celui d'un autre nœud.
  const obstacles: Box[] = nodes.map((n) => {
    const r = nodeRadius(n, level) + 1.5;
    return { x0: n.x - r, y0: n.y - r, x1: n.x + r, y1: n.y + r };
  });

  const placed = new Map<
    string,
    { dx: number; dy: number; anchor: "start" | "middle" | "end" }
  >();

  const ordered = [...nodes].sort((a, b) => rank(a) - rank(b) || b.weightedDegree - a.weightedDegree);

  for (const n of ordered) {
    const r = nodeRadius(n, level);
    const fs = labelFontSize(n);
    // Largeur approchée : suffisant pour de la détection de chevauchement, et
    // évite de mesurer 27 textes dans le DOM à chaque rendu.
    const w = n.display.length * fs * (isStructural(n) ? 0.72 : 0.55);
    const h = fs * 1.15;

    const vx = n.x - VIEWBOX.width / 2;
    const vy = n.y - VIEWBOX.height / 2;

    const candidates = [
      { dx: 0, dy: r + fs + 5, anchor: "middle" as const, dir: [0, 1] },
      { dx: 0, dy: -(r + 7), anchor: "middle" as const, dir: [0, -1] },
      { dx: r + 7, dy: fs * 0.36, anchor: "start" as const, dir: [1, 0] },
      { dx: -(r + 7), dy: fs * 0.36, anchor: "end" as const, dir: [-1, 0] },
    ];

    let best = candidates[0];
    let bestScore = Infinity;
    for (const c of candidates) {
      const x = n.x + c.dx;
      const y = n.y + c.dy;
      const x0 = c.anchor === "middle" ? x - w / 2 : c.anchor === "start" ? x : x - w;
      const box: Box = { x0, y0: y - h * 0.8, x1: x0 + w, y1: y + h * 0.25 };

      let score = 0;
      for (const o of obstacles) if (overlaps(box, o)) score += 3;
      for (const [id, p] of placed) {
        const other = nodes.find((nd) => nd.id === id)!;
        const ofs = labelFontSize(other);
        const ow = other.display.length * ofs * (isStructural(other) ? 0.72 : 0.55);
        const ox = other.x + p.dx;
        const oy = other.y + p.dy;
        const ox0 =
          p.anchor === "middle" ? ox - ow / 2 : p.anchor === "start" ? ox : ox - ow;
        if (
          overlaps(box, {
            x0: ox0,
            y0: oy - ofs * 0.92,
            x1: ox0 + ow,
            y1: oy + ofs * 0.29,
          })
        )
          score += 4;
      }
      // Sort du cadre : rédhibitoire.
      if (box.x0 < 4 || box.x1 > VIEWBOX.width - 4 || box.y0 < 4) score += 20;
      // À encombrement égal, on préfère la direction qui éloigne du centre du
      // nuage : les étiquettes s'ouvrent vers l'extérieur plutôt que vers
      // l'intérieur, ce qui garde le cœur lisible.
      const outward = Math.sign(vx) * c.dir[0] + Math.sign(vy) * c.dir[1];
      score += outward > 0 ? 0 : outward === 0 ? 0.4 : 0.8;

      if (score < bestScore) {
        bestScore = score;
        best = c;
      }
    }
    placed.set(n.id, { dx: best.dx, dy: best.dy, anchor: best.anchor });
  }

  return placed;
}

function mono(size: number, color: string) {
  return {
    fontFamily: "var(--font-mono)",
    fontSize: size,
    letterSpacing: "0.09em",
    color,
    margin: 0,
  } as const;
}

function chip(on: boolean) {
  return {
    fontFamily: "var(--font-mono)",
    fontSize: 10.5,
    letterSpacing: "0.09em",
    padding: "7px 12px",
    border: `1px solid ${INK}`,
    background: on ? INK : "transparent",
    color: on ? CREAM : INK,
    cursor: "pointer",
  } as const;
}

function Legend({ swatch, text }: { swatch: React.ReactNode; text: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
      {swatch}
      <span style={mono(10, MUTED)}>{text}</span>
    </span>
  );
}

function Dot({
  r,
  hollow,
  strokeWidth = 0,
}: {
  r: number;
  hollow?: boolean;
  strokeWidth?: number;
}) {
  return (
    <svg width={22} height={22} style={{ display: "block" }}>
      <circle
        cx={11}
        cy={11}
        r={r}
        fill={hollow ? "#FAF7F0" : INK}
        stroke={hollow ? INK : "none"}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

function Diamond({ r }: { r: number }) {
  return (
    <svg width={22} height={22} style={{ display: "block" }}>
      <rect
        x={11 - r}
        y={11 - r}
        width={r * 2}
        height={r * 2}
        transform="rotate(45 11 11)"
        fill={INK}
      />
    </svg>
  );
}

function Rule({ dashed }: { dashed?: boolean }) {
  return (
    <svg width={22} height={22} style={{ display: "block" }}>
      <line
        x1={2}
        y1={11}
        x2={20}
        y2={11}
        stroke={INK}
        strokeWidth={1.2}
        strokeDasharray={dashed ? "3 3" : undefined}
      />
    </svg>
  );
}

/** Poids réel de l'arête (1 à 3), rendu tel quel. Aucun mot n'est plaqué
 *  dessus : « structurant » ou « secondaire » seraient une interprétation que
 *  les données ne portent pas. */
function WeightBar({ weight }: { weight: number }) {
  return (
    <span style={{ display: "flex", gap: 2, flexShrink: 0, paddingTop: 4 }}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          style={{
            width: 9,
            height: 2,
            background: i <= weight ? INK : `${WARM}66`,
          }}
        />
      ))}
    </span>
  );
}

/**
 * Relations du nœud sélectionné, groupées par (kind, sens).
 *
 * Les quatre intitulés traduisent exactement les deux `kind` restants de
 * edges.json (`feeds`, `uses`) selon le sens de lecture. Rien de plus : la
 * nuance « utilisé dans » / « structure » n'existe pas dans les données —
 * `job-agent → python` et `job-agent → agentic-ai` sont toutes deux
 * `uses` / poids 3. L'inventer ici casserait la règle du §04.7.
 */
function relationGroups(node: LaidOutNode, graph: LaidOutGraph) {
  const defs: { title: string; kind: DNAEdge["kind"]; outgoing: boolean }[] = [
    { title: "ALIMENTE", kind: "feeds", outgoing: true },
    { title: "UTILISE", kind: "uses", outgoing: true },
    { title: "ALIMENTÉ PAR", kind: "feeds", outgoing: false },
    { title: "UTILISÉ PAR", kind: "uses", outgoing: false },
  ];

  return defs
    .map((d) => ({
      title: d.title,
      items: graph.edges
        .filter(
          (e) =>
            e.kind === d.kind &&
            (d.outgoing ? e.from === node.id : e.to === node.id)
        )
        .map((e) => {
          const otherId = d.outgoing ? e.to : e.from;
          return {
            id: `${d.title}-${otherId}`,
            label: graph.byId.get(otherId)?.display ?? otherId,
            weight: e.weight,
          };
        })
        .sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label, "fr")),
    }))
    .filter((g) => g.items.length > 0);
}
