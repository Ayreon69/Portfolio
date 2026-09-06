/**
 * UNIVERS AI WATCH — logique pure.
 *
 * Le snapshot (public/univers/ai-watch/ai-watch-2026-08-22.json) est la seule
 * source. Ce module ne recalcule aucun agrégat : il trie les lignes déjà
 * mesurées à l'export (scripts/export-ai-watch-snapshot.py), selon deux clés
 * qui existent toutes les deux dans le snapshot.
 */

export type SourceRow = {
  id: string;
  nom: string;
  categorie: string | null;
  poids: number | null;
  actif: boolean;
  items: number;
  utiles: number;
  rendement: number | null;
  score_moyen: number | null;
  raison_desactivation: string | null;
};

export type Snapshot = {
  meta: {
    snapshot: string;
    fenetre_debut: string;
    fenetre_fin: string;
    fenetre_jours: number;
    seuil_utile: number;
    exclusions: string;
    sources_declarees: number;
    sources_presentes: number;
    sources_sans_item: number;
  };
  totaux: { items: number; utiles: number };
  sous_ensemble_coupe: { items: number; utiles: number };
  sources: SourceRow[];
};

export type SortMode = "volume" | "rendement";

/**
 * Les sources sans aucun item sur la fenêtre (rendement non calculable) restent
 * groupées en fin de liste, dans les deux modes : les mélanger au classement
 * donnerait un sens à une absence de donnée qu'elle n'a pas.
 */
export function sortedSources(sources: SourceRow[], mode: SortMode): SourceRow[] {
  const presentes = sources.filter((s) => s.items > 0);
  const sansItem = sources.filter((s) => s.items === 0);

  const sorted = [...presentes].sort((a, b) =>
    mode === "volume" ? b.items - a.items : (b.rendement ?? 0) - (a.rendement ?? 0)
  );

  return [...sorted, ...sansItem];
}
