/**
 * UNIVERS COMMISSION BOT — constantes éditoriales, pas de données mesurées.
 *
 * Les quatre valeurs ci-dessous sont déjà entérinées dans
 * content/laboratoire/commission-bot.ts (sections 03 et 06). Elles ne sont
 * dérivées d'aucun snapshot, d'aucun export, d'aucune mesure d'usage — il
 * n'en existe aucune pour ce projet (06 RECUL : « aucune métrique d'usage
 * n'existe »). Ce module ne fait qu'exposer ces constantes sous un nom, et
 * projeter arithmétiquement la seule qui admet une multiplication : le
 * volume de documentation.
 */

export const DOC_TOKENS = 22_000;
export const MODEL_LIMIT = 128_000;
export const DEGRADATION_ZONE = { min: 40_000, max: 60_000 };
export const RATIO_ACTUEL = DOC_TOKENS / MODEL_LIMIT; // 17 %, déjà cité tel quel dans 06 RECUL.

export type Multiplicateur = 1 | 2 | 3;

/**
 * ×2 et ×3 ne sont jamais mesurés : c'est une multiplication arithmétique du
 * seul chiffre réel (22 000). Le composant doit toujours l'écrire en toutes
 * lettres à côté de la valeur — cette fonction ne renvoie qu'un nombre, pas
 * une affirmation.
 */
export function projeterTokens(mult: Multiplicateur): number {
  return DOC_TOKENS * mult;
}

export function estDansZoneDeDegradation(tokens: number): boolean {
  return tokens >= DEGRADATION_ZONE.min && tokens <= DEGRADATION_ZONE.max;
}

export function pourcentageDeLaLimite(tokens: number): number {
  return (tokens / MODEL_LIMIT) * 100;
}
