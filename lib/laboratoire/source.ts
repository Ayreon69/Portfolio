// Instance liée aux données réelles — même pattern que lib/data-dna/source.ts :
// la dérivation est pure et testable, le rattachement au dataset se fait ici,
// une seule fois, à l'import du module.

import aiWatch from "../../content/laboratoire/ai-watch";
import aramStats from "../../content/laboratoire/aram-stats";
import commissionBot from "../../content/laboratoire/commission-bot";
import jobAgent from "../../content/laboratoire/job-agent";
import { sourceNodes } from "../data-dna/source";
import { deriveProjects, type Project, type ProjectContent } from "./derive";

/**
 * Contenu éditorial des pages projet. Une section absente retombe sur le texte
 * court du graphe, puis sur « Contenu à intégrer » : la page dit toujours la
 * vérité sur son état. Rien n'est écrit deux fois.
 *
 * Job Agent est complet. Les trois autres n'ont que 02 CONSTRUCTION et
 * 04 DONNÉES : leur 06 RECUL attend une matière qui n'existe nulle part dans
 * le blueprint et ne peut venir que de Rayan.
 */
const content: Record<string, ProjectContent> = {
  "job-agent": jobAgent,
  "aram-stats": aramStats,
  "commission-bot": commissionBot,
  "ai-watch": aiWatch,
};

/** Les 4 expérimentations du laboratoire, numérotées 01 → 04 (§08.4). */
export const projects: Project[] = deriveProjects(sourceNodes, content);

export const projectBySlug = new Map(projects.map((p) => [p.slug, p]));

export type { Project };
