"use client";

import { useState } from "react";
import {
  DEGRADATION_ZONE,
  DOC_TOKENS,
  MODEL_LIMIT,
  RATIO_ACTUEL,
  estDansZoneDeDegradation,
  pourcentageDeLaLimite,
  projeterTokens,
  type Multiplicateur,
} from "@/lib/univers/commission-bot/engine";
import styles from "./CommissionBotUniverse.module.css";

/**
 * UNIVERS COMMISSION BOT — section 03 SYSTÈME de /laboratoire/commission-bot.
 *
 * Ce que ça doit faire ressentir : la limite qui compte n'est pas la limite
 * théorique du modèle (128k), c'est le budget pratique où l'attention se
 * dégrade déjà (40–60k). ×2 documentation suffit à y entrer, bien avant
 * d'approcher 128k.
 *
 * SOURCE : quatre constantes éditoriales déjà entérinées dans
 * content/laboratoire/commission-bot.ts (03 et 06) — aucun snapshot, aucune
 * mesure : ce projet n'a aucune métrique d'usage (06 RECUL). ×2 et ×3 sont
 * des projections arithmétiques de 22 000, jamais des volumes observés — le
 * texte le dit à chaque affichage, pas seulement une fois en haut de page.
 *
 * CE QUI N'EST JAMAIS REPRÉSENTÉ ICI : coût en euros, latence chiffrée,
 * qualité chiffrée, maintenance chiffrée — aucune de ces quatre choses n'a
 * de valeur numérique documentée. Elles restent uniquement dans le texte
 * ci-dessous, jamais portées par la barre ou par un nombre affiché.
 *
 * COHABITATION AVEC LE CANVAS PERSISTANT : enfant normal de `<main>`
 * (z-index 1), au-dessus du halo (z-index 0, pointer-events none). SVG/DOM
 * uniquement (D-18) — aucun canvas, aucun second contexte de rendu.
 */

const MULTIPLICATEURS: Multiplicateur[] = [1, 2, 3];

const VB_W = 700;
const VB_H = 96;
const AXIS_Y = 46;
const BAR_H = 18;
const PAD_L = 6;
const PAD_R = 6;
const SCALE_W = VB_W - PAD_L - PAD_R;

const x = (tokens: number) => PAD_L + (tokens / MODEL_LIMIT) * SCALE_W;

export default function CommissionBotUniverse() {
  const [mult, setMult] = useState<Multiplicateur>(1);
  const projected = projeterTokens(mult);
  const dansZone = estDansZoneDeDegradation(projected);
  const pourcentage = pourcentageDeLaLimite(projected);

  const zoneX = x(DEGRADATION_ZONE.min);
  const zoneW = x(DEGRADATION_ZONE.max) - zoneX;
  const cursorX = x(projected);
  const ancrageX = x(DOC_TOKENS);

  return (
    <div className={styles.wrapper}>
      <p className={styles.lead}>
        22 000 tokens de documentation sur une fenêtre de 128 000, soit 17 % de
        la limite théorique. Mais l&apos;attention du modèle se dégrade avant
        cette limite, autour de 40 000 à 60 000 tokens sur un contexte dense
        en tableaux et en code. Le contrôle ci-dessous projette une
        documentation plus volumineuse pour voir où elle tombe.
      </p>

      <div className={styles.controls} role="group" aria-label="Multiplicateur de documentation">
        {MULTIPLICATEURS.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mult === m}
            onClick={() => setMult(m)}
          >
            ×{m}
          </button>
        ))}
      </div>

      <div className={styles.svgWrap}>
        <svg
          className={styles.bar}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          role="img"
          aria-label={`Échelle de 0 à ${MODEL_LIMIT.toLocaleString(
            "fr-FR"
          )} tokens. Documentation projetée à ×${mult} : ${projected.toLocaleString(
            "fr-FR"
          )} tokens, ${dansZone ? "dans" : "hors de"} la zone de dégradation 40 000–60 000.`}
        >
          {/* Piste complète jusqu'à la limite théorique du modèle. */}
          <rect
            x={PAD_L}
            y={AXIS_Y - BAR_H / 2}
            width={SCALE_W}
            height={BAR_H}
            fill="none"
            stroke="var(--line-strong)"
          />

          {/* Zone de dégradation réelle — jamais en rouge/alerte : un
              phénomène documenté, pas une panne. */}
          <rect
            x={zoneX}
            y={AXIS_Y - BAR_H / 2}
            width={zoneW}
            height={BAR_H}
            fill="var(--warm-neutral)"
            opacity={0.25}
          />
          <text x={zoneX} y={AXIS_Y - BAR_H / 2 - 8} className={styles.zoneLabel}>
            zone de dégradation 40k–60k
          </text>

          {/* Ancrage : la documentation réelle d'aujourd'hui, toujours visible
              même quand le curseur (projection) s'en éloigne. */}
          <line
            x1={ancrageX}
            x2={ancrageX}
            y1={AXIS_Y - BAR_H / 2 - 4}
            y2={AXIS_Y + BAR_H / 2 + 4}
            stroke="var(--ink-mid)"
            strokeWidth={1}
          />

          {/* Curseur : la projection au multiplicateur choisi. */}
          <g className={styles.cursor} transform={`translate(${cursorX}, 0)`}>
            <line
              x1={0}
              x2={0}
              y1={AXIS_Y - BAR_H / 2 - 10}
              y2={AXIS_Y + BAR_H / 2 + 10}
              stroke="var(--accent)"
              strokeWidth={2}
            />
            <text x={0} y={AXIS_Y - BAR_H / 2 - 16} textAnchor="middle" className={styles.cursorLabel}>
              {projected.toLocaleString("fr-FR")}
            </text>
          </g>

          {/* Limite théorique du modèle, à l'extrémité de la piste. */}
          <text
            x={PAD_L + SCALE_W}
            y={AXIS_Y + BAR_H / 2 + 20}
            textAnchor="end"
            className={styles.limitLabel}
          >
            limite du modèle — {MODEL_LIMIT.toLocaleString("fr-FR")}
          </text>
          <text x={PAD_L} y={AXIS_Y + BAR_H / 2 + 20} className={styles.axisLabel}>
            0
          </text>
        </svg>
      </div>

      <p className={`mono ${styles.readout}`} aria-live="polite">
        ×{mult} documentation : <strong>{projected.toLocaleString("fr-FR")}</strong>{" "}
        tokens, soit <strong>{pourcentage.toFixed(0)} %</strong> de la limite du
        modèle,{" "}
        {dansZone
          ? "dans la zone où l'attention du modèle se dégrade déjà"
          : mult === 1
            ? "sous la zone de dégradation"
            : "au-delà de la zone de dégradation mesurée"}
        .
      </p>

      <p className={styles.projectionNote}>
        {mult === 1
          ? `${DOC_TOKENS.toLocaleString("fr-FR")} tokens est le volume de la documentation actuelle (${(RATIO_ACTUEL * 100).toFixed(0)} % de la limite du modèle), et la seule valeur mesurée ici.`
          : `×${mult} est une projection arithmétique des ${DOC_TOKENS.toLocaleString("fr-FR")} tokens mesurés. Aucune documentation de cette taille n'existe aujourd'hui.`}
      </p>

      <p className={styles.narrative}>
        Doubler la documentation double le coût et la latence de chaque
        question sans rien gagner en qualité. On paie deux fois pour le même
        résultat, sans même avoir approché le plafond théorique. Ni le coût ni
        la qualité ne sont mesurés aujourd&apos;hui, faute de métrique
        d&apos;usage sur ce bot. Et la limite qui arrivera d&apos;abord
        n&apos;est pas celle du modèle. Le jour où une seconde source
        hétérogène s&apos;ajoute, ou où le volume triple, la maintenance
        manuelle du dictionnaire d&apos;anonymisation et du résumé métier lâche
        pendant que le contexte, lui, tient encore.
      </p>
    </div>
  );
}
