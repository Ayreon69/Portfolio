"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { decodeSnapshot, type Labels, type Snapshot } from "@/lib/univers/aram/format";
import { aggregate, TIER_STEP, type View } from "@/lib/univers/aram/engine";
import styles from "./AramUniverse.module.css";

/**
 * UNIVERS ARAM — section 03 SYSTÈME de /laboratoire/aram-stats.
 *
 * Principe : l'univers ne décore pas le projet, il en fait ressentir le
 * fonctionnement. Ici, ce qui doit se ressentir tient en une phrase — le calcul
 * se fait dans le navigateur, sur des colonnes binaires, en une passe unique.
 * Donc on ne le raconte pas : on le fait devant le lecteur, et on affiche le
 * nombre de lignes parcourues et le temps mesuré.
 *
 * COHABITATION AVEC LE CANVAS PERSISTANT (§07.1)
 * Le halo vit dans une couche `position: fixed; inset: 0; z-index: 0;
 * pointer-events: none`, montée dans le layout racine. Le contenu, lui, est
 * dans `<main style="position: relative; z-index: 1">`. Ce composant est un
 * enfant normal de `main` : il est donc AU-DESSUS du halo dans l'ordre
 * d'empilement, et reçoit ses événements sans que rien ne soit modifié côté
 * système persistant — ni z-index, ni pointer-events, ni géométrie. Ce canvas
 * est un contexte 2D : il n'ouvre aucun second contexte WebGL.
 *
 * MOUVEMENT : il n'y en a aucun. Pas de transition CSS, pas de boucle
 * d'animation, pas de rAF — le canvas est redessiné une fois par changement
 * d'état, sur une action de l'utilisateur. `prefers-reduced-motion` n'a donc
 * rien à retirer : le contenu est déjà identique dans les deux réglages, et
 * aucun garde-fou conditionnel n'est nécessaire ici.
 *
 * PROGRESSION : le serveur rend déjà un classement lisible (AramFallback).
 * Ce composant l'enveloppe et ne le remplace qu'une fois les colonnes
 * décodées, et seulement là où c'est justifié — jamais sur mobile, où les
 * 140 Ko ne sont même pas demandés.
 */

const PATCH = "16.17";
const BASE = `/univers/aram/aram-${PATCH}`;

/** Seuils proposés — de « tout garder » à « seulement ce qui tranche ». */
const SAMPLES = [0, 50, 200, 1000];

type Data = { snapshot: Snapshot; labels: Labels };

export default function AramUniverse({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Data | null>(null);
  const [failed, setFailed] = useState(false);

  const [view, setView] = useState<View>("augment");
  const [champion, setChampion] = useState<number | null>(null);
  // 0 par defaut : un controle qui ne change rien quand on y touche la
  // premiere fois apprend au visiteur a ne plus y toucher.
  const [minSample, setMinSample] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Chargement — uniquement sur pointeur fin et écran large. Sur mobile, le
  // classement rendu par le serveur EST la représentation (§10.1 : « la donnée
  // est identique, la représentation change »), et rien n'est téléchargé.
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(max-width: 899px)").matches) return;

    let cancelled = false;
    (async () => {
      try {
        const [binResponse, labelsResponse] = await Promise.all([
          fetch(`${BASE}.bin.gz`),
          fetch(`${BASE}.labels.json`),
        ]);
        if (!binResponse.ok || !labelsResponse.ok) throw new Error("snapshot");

        // Décompression native — le même mécanisme que le site du projet.
        // `DecompressionStream` manque sur quelques navigateurs : l'absence
        // est traitée comme un échec de chargement, donc un repli, pas un
        // écran cassé.
        if (typeof DecompressionStream === "undefined") throw new Error("gzip");
        const stream = binResponse.body!.pipeThrough(new DecompressionStream("gzip"));
        const buffer = await new Response(stream).arrayBuffer();

        const labels = (await labelsResponse.json()) as Labels;
        if (cancelled) return;
        setData({ snapshot: decodeSnapshot(buffer), labels });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const result = useMemo(() => {
    if (!data) return null;
    const t0 = performance.now();
    const r = aggregate(data.snapshot, { view, champion, minSample });
    const ms = performance.now() - t0;
    return { ...r, ms };
  }, [data, view, champion, minSample]);

  const names = data ? (view === "augment" ? data.labels.augment : data.labels.item) : [];

  // Rendu du nuage : taux de victoire (y) contre échantillon (x, log).
  // Le trait horizontal de chaque point est son intervalle de confiance : on
  // voit d'un coup d'œil que l'incertitude s'écrase quand l'échantillon monte.
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !result) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const style = getComputedStyle(canvas);
    const ink = style.getPropertyValue("--ink").trim() || "#1a1a18";
    const warm = style.getPropertyValue("--warm-neutral").trim() || "#8a7f6a";
    const accent = style.getPropertyValue("--accent").trim() || ink;

    const pad = { top: 14, right: 16, bottom: 30, left: 44 };
    const plotW = Math.max(1, width - pad.left - pad.right);
    const plotH = Math.max(1, height - pad.top - pad.bottom);

    const rows = result.rows;
    if (rows.length === 0) return;

    const maxN = Math.max(...rows.map((r) => r.n), 10);
    const winrates = rows.flatMap((r) => [r.lo, r.hi]);
    const lo = Math.min(...winrates, 45);
    const hi = Math.max(...winrates, 55);

    const x = (n: number) =>
      pad.left + (Math.log10(Math.max(n, 1)) / Math.log10(maxN)) * plotW;
    const y = (w: number) => pad.top + plotH - ((w - lo) / (hi - lo)) * plotH;

    // Repère : la ligne des 50 %, seul niveau qui ait un sens ici.
    ctx.strokeStyle = warm;
    ctx.globalAlpha = 0.45;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(pad.left, y(50));
    ctx.lineTo(width - pad.right, y(50));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    ctx.font = "10px var(--font-mono), monospace";
    ctx.fillStyle = warm;
    ctx.textAlign = "right";
    ctx.fillText("50 %", pad.left - 6, y(50) + 3);
    ctx.textAlign = "left";
    ctx.fillText("échantillon →", pad.left, height - 8);
    ctx.fillText("↑ taux de victoire", pad.left, pad.top - 3);

    for (const r of rows) {
      const px = x(r.n);
      const py = y(r.winrate);
      // Intervalle de confiance, en vertical : c'est une incertitude sur le
      // taux de victoire, pas sur l'échantillon.
      ctx.strokeStyle = r.decidable ? accent : warm;
      ctx.globalAlpha = r.decidable ? 0.55 : 0.3;
      ctx.beginPath();
      ctx.moveTo(px, y(r.lo));
      ctx.lineTo(px, y(r.hi));
      ctx.stroke();

      ctx.globalAlpha = 1;
      ctx.fillStyle = r.decidable ? accent : warm;
      ctx.beginPath();
      ctx.arc(px, py, r.decidable ? 2.6 : 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [result]);

  useEffect(() => {
    draw();
    if (!canvasRef.current) return;
    const observer = new ResizeObserver(() => draw());
    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [draw]);

  // Tant que rien n'est chargé — mobile, sans JS, ou échec — le classement
  // rendu par le serveur reste en place. Il n'est jamais vidé.
  if (!data) {
    return (
      <div className={styles.wrapper}>
        {children}
        {failed && (
          <p className={`mono ${styles.note}`}>
            Instantané indisponible — le classement ci-dessus reste celui de
            l&apos;export.
          </p>
        )}
      </div>
    );
  }

  // `data` est chargé, donc `result` l'est aussi : le useMemo dépend des deux.
  if (!result) return <div className={styles.wrapper}>{children}</div>;

  const decidableCount = result.rows.filter((r) => r.decidable).length;
  const top = result.rows.slice(0, 10);

  const snapshotRows = Object.values(data.snapshot.tables).reduce(
    (total, t) => total + t.rows,
    0
  );

  return (
    <div className={styles.wrapper}>
      {/* Sans cette phrase, le visiteur voit trois menus déroulants et ne sait
          pas que le calcul se fait chez lui. Et surtout : il lirait les
          millisecondes ci-dessous comme celles du site public (11 à 37 ms sur
          1,5 M de lignes, §05), alors qu'elles portent sur une tranche
          réduite. Les deux chiffres doivent être séparés explicitement. */}
      <p className={styles.lead}>
        Ces trois filtres n&apos;interrogent aucun serveur : ils relancent le
        calcul dans votre navigateur, sur des colonnes binaires téléchargées
        une fois. Le compteur sous le graphique dit ce que cette passe a
        réellement coûté, ici et maintenant.
      </p>
      <p className={`mono ${styles.snapshot}`}>
        Instantané du patch {data.labels.patch} ·{" "}
        {data.labels.games.toLocaleString("fr-FR")} parties · export du{" "}
        {data.labels.exportedAt} ·{" "}
        {snapshotRows.toLocaleString("fr-FR")} lignes d&apos;agrégats — une
        tranche réduite servie à cette page, pas les 1,5 million de lignes du
        site public.
      </p>

      <div className={`mono ${styles.controls}`}>
        <label className={styles.control}>
          <span className={styles.controlLabel}>Champion</span>
          <select
            value={champion === null ? "" : String(champion)}
            onChange={(e) =>
              setChampion(e.target.value === "" ? null : Number(e.target.value))
            }
          >
            <option value="">Tous</option>
            {data.labels.champion.map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>Vue</span>
          <select value={view} onChange={(e) => setView(e.target.value as View)}>
            <option value="augment">Augments</option>
            <option value="item">Objets</option>
          </select>
        </label>

        <label className={styles.control}>
          <span className={styles.controlLabel}>Échantillon min.</span>
          <select
            value={String(minSample)}
            onChange={(e) => setMinSample(Number(e.target.value))}
          >
            {SAMPLES.map((s) => (
              <option key={s} value={s}>
                {s === 0 ? "aucun" : `${s} parties`}
              </option>
            ))}
          </select>
        </label>
      </div>

      <canvas
        ref={canvasRef}
        className={styles.canvas}
        role="img"
        aria-label={`Taux de victoire en fonction de l'échantillon — ${
          result.matched
        } lignes, dont ${decidableCount} tranchables. Le tableau ci-dessous porte les mêmes données.`}
      />

      {/* Une seule source pour toute la ligne : `result`. Tirer le compte de
          lignes d'un state et le compte de tranchables du calcul courant les
          désynchronisait d'un rendu — deux chiffres vrais, mais pas au même
          instant, sur la même phrase. */}
      <p className={`mono ${styles.readout}`} aria-live="polite">
        Passe unique&nbsp;: <strong>{result.scanned.toLocaleString("fr-FR")}</strong>{" "}
        lignes lues en{" "}
        <strong>{result.ms.toFixed(2).replace(".", ",")} ms</strong> →{" "}
        <strong>{result.matched}</strong> {result.matched > 1 ? "réponses" : "réponse"},
        dont <strong>{decidableCount}</strong>{" "}
        {decidableCount > 1 ? "tranchables" : "tranchable"} (intervalle plus
        étroit que l&apos;écart entre deux paliers de tier,{" "}
        {TIER_STEP.toString().replace(".", ",")}&nbsp;point).
      </p>

      <table className={styles.table}>
        <caption className={`mono ${styles.caption}`}>
          Les dix premières lignes du calcul en cours. L&apos;intervalle est
          celui du score de Wilson à 95&nbsp;% : sur un petit échantillon il
          reste large, même quand le taux de victoire affiche 100&nbsp;%. Une
          ligne trop incertaine pour conclure est écrite en retrait et le dit.
        </caption>
        <thead className="mono">
          <tr>
            <th scope="col">{view === "augment" ? "Augment" : "Objet"}</th>
            <th scope="col">Parties</th>
            <th scope="col">Victoires</th>
            <th scope="col">Intervalle</th>
          </tr>
        </thead>
        <tbody>
          {top.map((r) => (
            <tr key={r.id} data-decidable={r.decidable ? "" : undefined}>
              <td>{names[r.id] ?? `#${r.id}`}</td>
              <td className="mono">{r.n.toLocaleString("fr-FR")}</td>
              <td className="mono">{r.winrate.toFixed(1).replace(".", ",")} %</td>
              <td className="mono">
                {r.decidable
                  ? `± ${r.margin.toFixed(2).replace(".", ",")}`
                  : `± ${r.margin.toFixed(2).replace(".", ",")} — non tranchable`}
              </td>
            </tr>
          ))}
          {top.length === 0 && (
            <tr>
              <td colSpan={4}>
                Aucune ligne au-dessus de ce seuil d&apos;échantillon.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
