// Décodage de l'instantané ARAM — pur, sans dépendance au DOM.
//
// Le fichier est produit par scripts/export-aram-snapshot.py et versionné dans
// public/univers/aram/. Sa forme :
//
//     [u32 headerLen][headerLen octets de JSON UTF-8][colonnes brutes]
//
// Colonne-majeur, identifiants remplacés par un index de dictionnaire, offsets
// alignés sur 4 octets. C'est le format du site public du projet — pas une
// invention pour le portfolio.
//
// Ce module ne connaît ni React, ni `fetch`, ni `DecompressionStream` : il
// reçoit un ArrayBuffer déjà décompressé et rend des vues typées. Aucune copie
// des données n'est faite — les TypedArrays pointent dans le buffer d'origine.

export type ColumnType = "u16" | "u32";

type ColumnHeader = {
  name: string;
  type: ColumnType;
  offset: number;
  bytes: number;
};

type SnapshotHeader = {
  patch: string;
  tables: Record<string, { rows: number; columns: ColumnHeader[] }>;
};

/** Une table décodée : ses colonnes, en vues typées sur le buffer d'origine. */
export type Table = {
  rows: number;
  columns: Record<string, Uint16Array | Uint32Array>;
};

export type Snapshot = {
  patch: string;
  tables: Record<string, Table>;
  /** Octets réellement occupés en mémoire par les colonnes. */
  bytes: number;
};

export type Labels = {
  patch: string;
  exportedAt: string;
  games: number;
  players: number;
  champion: string[];
  augment: string[];
  item: string[];
};

export function decodeSnapshot(buffer: ArrayBuffer): Snapshot {
  const view = new DataView(buffer);
  const headerLength = view.getUint32(0, true);
  const headerBytes = new Uint8Array(buffer, 4, headerLength);
  const header = JSON.parse(new TextDecoder().decode(headerBytes)) as SnapshotHeader;

  // Les offsets du header sont relatifs au DÉBUT du corps, pas du fichier.
  const bodyStart = 4 + headerLength;

  const tables: Record<string, Table> = {};
  let bytes = 0;

  for (const [name, spec] of Object.entries(header.tables)) {
    const columns: Table["columns"] = {};
    for (const col of spec.columns) {
      const start = bodyStart + col.offset;
      columns[col.name] =
        col.type === "u16"
          ? new Uint16Array(buffer, start, spec.rows)
          : new Uint32Array(buffer, start, spec.rows);
      bytes += col.bytes;
    }
    tables[name] = { rows: spec.rows, columns };
  }

  return { patch: header.patch, tables, bytes };
}
