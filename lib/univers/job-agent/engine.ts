/**
 * UNIVERS JOB AGENT — types et logique pure.
 *
 * Source unique : public/univers/job-agent/job-agent-trace-24.json, gelé et
 * daté (D-17), généré une fois par scripts/export-job-agent-snapshot.py à
 * partir de deux traces réelles du pipeline de scoring RAG (offre 24,
 * jamais rejouée). Ce module ne recalcule aucune distance : il ne fait que
 * mettre en forme ce que les traces contiennent déjà.
 */

export type CompositeItem = {
  texte: string;
  distance: number | null;
  verdict: "retenu" | "flag_uncertain";
};

export type Atom = {
  label: string;
  distance: number | null;
  verdict: "retenu" | "flag_uncertain";
};

export type ResumeAutre = {
  texte: string;
  distance: number | null;
  verdict: "retenu" | "flag_uncertain";
  atomes: number;
};

export type Snapshot = {
  meta: {
    snapshot: string;
    offer_id: number;
    source_composite: string;
    source_atomic: string;
    note: string;
  };
  composite: {
    requirements: number;
    retenues: number;
    signaux: number;
    items: CompositeItem[];
  };
  atomique: {
    atomes: number;
    retenus: number;
    signaux: number;
    qms: { texte: string; atomes: Atom[] };
    resume_autres: ResumeAutre[];
  };
};

export type Vue = "composite" | "atomique";

/**
 * Formatage à 3 décimales sans le piège du binaire flottant : 0.7625 stocké
 * en IEEE754 vaut très légèrement moins que 0.7625, mais ×1000 retombe pile
 * sur 762.5 — Math.round arrondit alors .5 vers le haut, comme un lecteur
 * humain le ferait. `toFixed` seul aurait pu arrondir l'autre sens.
 */
export function formatDistance(d: number | null): string {
  if (d === null) return "—";
  return (Math.round(d * 1000) / 1000).toFixed(3).replace(".", ",");
}
