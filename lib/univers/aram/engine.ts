// Moteur d'agrégation ARAM — une passe, sur des TypedArrays.
//
// Pur : aucune dépendance au DOM, au React ou au réseau. C'est ce qui le rend
// mesurable — la fonction rend elle-même le nombre de lignes parcourues, et
// l'appelant chronomètre l'appel.
//
// CE QUE CE MOTEUR N'EST PAS : une reproduction du moteur du site public.
// Celui-là filtre 1,5 M de lignes joueur en 11 à 37 ms. Ici, l'instantané ne
// contient que les AGRÉGATS déjà calculés par le pipeline Python — quelques
// dizaines de milliers de lignes. Les deux chiffres ne sont pas comparables et
// la page ne doit jamais laisser croire qu'ils le sont.

import type { Snapshot } from "./format";

export type View = "augment" | "item";

export type Query = {
  view: View;
  /** Index de champion dans le dictionnaire, ou `null` pour « tous ». */
  champion: number | null;
  /** Échantillon minimum : une ligne sous ce seuil est écartée. */
  minSample: number;
};

export type Row = {
  /** Index dans le dictionnaire de libellés correspondant à la vue. */
  id: number;
  n: number;
  wins: number;
  /** Taux de victoire en points de pourcentage. */
  winrate: number;
  /** Demi-largeur de l'intervalle de confiance à 95 %, en points. */
  margin: number;
  /** Bornes de l'intervalle, en points — asymétriques autour du taux. */
  lo: number;
  hi: number;
  /**
   * `true` quand l'intervalle est plus étroit que l'écart entre deux paliers
   * de tier. En dessous, la ligne existe mais ne tranche rien.
   */
  decidable: boolean;
};

export type Result = {
  rows: Row[];
  /** Lignes réellement parcourues par la passe — pas les lignes rendues. */
  scanned: number;
  /** Lignes retenues avant tri. */
  matched: number;
};

/**
 * Écart entre deux paliers de tier, en points de pourcentage (§06 de la page
 * projet). Une ligne dont l'intervalle de confiance dépasse cet écart ne
 * permet pas de départager deux paliers : elle est affichée, mais annoncée
 * comme non tranchable.
 */
export const TIER_STEP = 1.5;

/**
 * Intervalle de confiance à 95 % d'une proportion — score de WILSON, en points.
 *
 * Pourquoi Wilson et pas l'intervalle usuel 1,96 × √(p(1−p)/n) : à p = 0 ou
 * p = 1, ce dernier rend une largeur NULLE. Une ligne à 6 parties et 100 % de
 * victoires ressortait donc « ± 0,00 », c'est-à-dire présentée comme la plus
 * certaine du tableau — exactement l'inverse de la vérité, et un mensonge que
 * la page aurait affiché en toutes lettres. Wilson ne s'effondre pas aux
 * bornes : la même ligne rend ±19 points, et n'est pas tranchable.
 *
 * Le chiffre publié en 06 est préservé — sur un échantillon large, Wilson et
 * l'intervalle usuel coïncident : 10 000 picks à 50 % donnent ±0,98 point,
 * soit « ±1 point » quand les paliers de tier valent 1,5. Rien n'est calibré
 * à la main, et scripts/check-data.ts garde ce chiffre sous contrôle.
 */
const Z = 1.96;

export function wilson95(wins: number, n: number): { lo: number; hi: number; margin: number } {
  if (n <= 0) return { lo: 0, hi: 100, margin: Infinity };
  const p = wins / n;
  const z2 = (Z * Z) / n;
  const center = (p + z2 / 2) / (1 + z2);
  const half =
    (Z / (1 + z2)) * Math.sqrt((p * (1 - p)) / n + (Z * Z) / (4 * n * n));
  return { lo: (center - half) * 100, hi: (center + half) * 100, margin: half * 100 };
}

/** Demi-largeur seule — conservée pour les contrôles et la lisibilité. */
export function margin95(wins: number, n: number): number {
  return wilson95(wins, n).margin;
}

export function aggregate(snapshot: Snapshot, query: Query): Result {
  const rows: Row[] = [];

  const push = (id: number, n: number, wins: number) => {
    if (n < query.minSample) return;
    const { lo, hi, margin } = wilson95(wins, n);
    rows.push({
      id,
      n,
      wins,
      winrate: (wins / n) * 100,
      margin,
      lo,
      hi,
      decidable: margin < TIER_STEP,
    });
  };

  let scanned = 0;

  if (query.champion === null) {
    // Vue globale : la table simple suffit, le pipeline l'a déjà agrégée.
    const table = snapshot.tables[query.view];
    const ids = table.columns.id;
    const ns = table.columns.n;
    const ws = table.columns.wins;
    scanned = table.rows;
    for (let i = 0; i < table.rows; i++) push(ids[i], ns[i], ws[i]);
  } else {
    // Vue par champion : une passe unique sur la table de paires. Pas d'index,
    // pas de tri préalable, pas de jointure — c'est le point de la démonstration
    // et c'est aussi ce que fait le moteur du projet.
    const table =
      query.view === "augment"
        ? snapshot.tables.champ_augment
        : snapshot.tables.champ_item;
    const as = table.columns.a;
    const bs = table.columns.b;
    const ns = table.columns.n;
    const ws = table.columns.wins;
    scanned = table.rows;
    for (let i = 0; i < table.rows; i++) {
      if (as[i] !== query.champion) continue;
      push(bs[i], ns[i], ws[i]);
    }
  }

  const matched = rows.length;
  // Tri par taux de victoire décroissant, puis par volume : deux lignes à
  // égalité sont départagées par l'échantillon, jamais par l'ordre d'arrivée.
  rows.sort((x, y) => y.winrate - x.winrate || y.n - x.n);

  return { rows, scanned, matched };
}
