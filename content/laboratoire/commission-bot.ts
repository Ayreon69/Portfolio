import type { ProjectContent } from "@/lib/laboratoire/derive";

/**
 * COMMISSION BOT — sections 02 et 04 uniquement.
 *
 * Matière : PORTFOLIO-SOURCE-DE-VERITE-v4.md §04.4.03 et §09.5.
 * Contrainte §09.4 : projet anonymisé, aucune information financière sensible.
 * Aucun nom de périmètre, de produit ni de client ne figure ici — le dépôt
 * lui-même reste privé pour cette raison.
 *
 * 06 RECUL vient des réponses de Rayan, pas du blueprint.
 */
const commissionBot: ProjectContent = {
  construction: {
    paragraphs: [
      "Un assistant conversationnel qui explique les règles de calcul sans jamais calculer lui-même. Il cite le script métier ; il ne se substitue pas à lui, et n'invente pas une règle qu'il n'y trouve pas.",
      "Pas de RAG. Le contexte complet (script métier et paramétrage Excel converti en Markdown) est injecté tel quel dans le system prompt. Environ 22 000 tokens, largement sous la limite de 128k. Découper et indexer aurait ajouté de la machinerie sans rien résoudre.",
      "Deux mécanismes tiennent le reste. L'anonymisation automatique des noms internes avant tout appel API, par remplacement de texte, avec un dictionnaire trié par longueur décroissante pour éviter les collisions de noms. Et un retry à backoff sur rate limit. Température basse (0.3), pour des réponses factuelles.",
    ],
  },

  // 03 — le trajet d'une question, distinct de 02 qui dit ce qui a été construit.
  system: {
    chain: ["QUESTION", "ANONYMISATION", "CONTEXTE COMPLET", "API MISTRAL (T° 0.3)", "RÉPONSE SOURCÉE"],
    paragraphs: [
      "Le contexte n'est pas seulement du code recopié : il est assemblé avec un résumé métier écrit à la main, qui explique au modèle comment lire ce script. C'est cette pièce-là, plus que le code, qui décide de la qualité d'une réponse.",
      "À chaque question, le dictionnaire d'anonymisation est appliqué avant l'appel, remplacements triés par longueur décroissante pour qu'un nom court n'écrase pas un nom long qui le contient. Rien ne part vers l'API sous son vrai nom.",
      "Le modèle n'a ni outil, ni index, ni mémoire : seulement ce contexte, à température basse, avec la consigne de relire le code plutôt que de répondre de mémoire. Sa seule sortie possible est une explication qui cite la règle. Le calcul, lui, reste dans le moteur Python, que le bot n'appelle pas.",
    ],
  },

  donnees: {
    paragraphs: [
      "Environ 22 000 tokens de base de connaissance, couvrant l'intégralité des règles de calcul : le script métier et son fichier de paramétrage.",
      "Aucune base de données. Le contexte est reconstruit à chaque démarrage depuis les fichiers sources : la source de vérité reste le code métier lui-même, jamais une copie indexée qui pourrait diverger de lui.",
      "Seul ce qui part vers le LLM est anonymisé. Les fichiers sources, eux, portent les vrais noms de l'employeur. C'est ce qui rend ce dépôt impossible à publier tel quel, et ce projet visible uniquement en case study.",
    ],
    stack: ["Python", "Gradio", "API Mistral", "pandas"],
  },

  result: {
    paragraphs: [
      "La base de connaissance couvre l'intégralité des règles de calcul, et le bot les sert en citant le code plutôt qu'en les reformulant : il n'invente pas une règle qu'il n'y trouve pas.",
      "Il est déployé et utilisé en interne. Mais aucune métrique d'usage n'existe, et des réponses ont été contestées : la preuve s'arrête là. C'est ce qui range ce projet en case study plutôt qu'en démonstration, et ce que la section suivante creuse.",
    ],
  },

  // 06 - RECUL : redige par Rayan (2026-09-06). Seule section de cette page dont
  // la matiere ne vient pas du blueprint - celui-ci n'en contient aucune.
  // Reponses mises en forme editoriale, sans ajout factuel.
  recul: {
    paragraphs: [
      "22 000 tokens sur 128k, c'est 17 % de la fenêtre : large marge, en apparence. Mais le budget réel n'est pas 128k. Trois choses se dégradent avant la limite dure.",
      "Le coût et la latence d'abord : chaque question refacture les 22 000 tokens en entrée. Doubler la documentation (nouveaux périmètres, nouveaux produits) double le coût par question et la latence, sans aucun gain de qualité. C'est un mauvais rendement, pas seulement un plafond.",
      "L'attention du modèle ensuite. Sur un contexte dense en tableaux et en code, la dégradation arrive plutôt vers 40 à 60k tokens que vers 128k : une règle précise se retrouve moins bien quand elle est noyée dans un gros bloc. Le system prompt contient déjà un résumé métier écrit à la main pour compenser. C'est le signe que le modèle peine sur le code brut dès 22 000 tokens, pas qu'il reste de la marge.",
      "La maintenabilité humaine enfin : le dictionnaire d'anonymisation et ce résumé se mettent à jour à la main, à chaque nouveau périmètre. Ça casse en pratique bien avant de casser techniquement. Le seuil concret n'est donc pas « 128k atteint » : c'est l'ajout d'une deuxième source hétérogène (un second script métier, une documentation PDF, un autre fichier de règles), ou un volume deux à trois fois supérieur.",
      "Ce que je ferais alors, avant un RAG classique : un découpage statique par thème, pas par similarité vectorielle. Un routeur simple, ou le modèle lui-même, choisit quels blocs de règles injecter, chaque bloc restant entier et cohérent. Les règles s'entrecroisent ici, et un chunk isolé perdrait le contexte : voir toutes les règles à la fois est précisément ce qui a de la valeur. Ensuite seulement du cache de contexte pour absorber la répétition, et le RAG en dernier recours.",
      "Le « à retravailler » a un nom : la qualité des réponses. Le bot est déployé et utilisé, des réponses ont été contestées, des cas d'erreur précis ont été remontés. Ce n'est ni un problème d'adoption, ni un problème de confiance en abstrait. La confiance s'érode parce que la qualité est insuffisante, dans cet ordre.",
      "Avec cette architecture, les erreurs viennent structurellement de trois points. L'interprétation du code métier, que le résumé écrit à la main ne mitige que jusqu'au jour où il dérive du code sans que personne ne le remette à jour. La confusion entre deux périmètres proches après anonymisation, quand les préfixes se chevauchent. Et l'absence de traçabilité : rien dans une réponse n'indique quelle règle exacte la fonde, donc l'utilisateur métier ne peut pas vérifier vite, et je ne peux pas savoir pourquoi une réponse a dérapé sans creuser les logs. La suite n'est pas une refonte : c'est creuser les cas d'erreur déjà remontés, où un motif répété sur trois ou quatre exemples vaut plus que n'importe quelle architecture théorique.",
      "Je tiendrais la frontière « expliquer, jamais calculer », et pas par prudence technique. Un modèle qui calcule un précompte rend un nombre avec la même assurance qu'il rend une explication fausse : rien dans sa sortie ne distingue la certitude de l'hallucination. Une explication fausse est visible et corrigible par quelqu'un qui connaît le métier. Un montant faux peut passer inaperçu et devenir une décision financière, ou un chiffre transmis à un tiers. Le risque n'est pas symétrique : l'une coûte de la confiance, l'autre peut coûter de l'argent réel et être difficile à tracer après coup.",
      "Le moteur Python existe précisément pour ça : déterministe, testable, versionné, le même résultat pour les mêmes entrées. Faire calculer le modèle en parallèle recréerait un second moteur de calcul, non déterministe et non auditable, qui pourrait diverger silencieusement du premier, sans que personne ne sache lequel a raison en cas d'écart.",
      "Si on me demandait de lever cette frontière, ma réponse serait : pas via le LLM. Si le vrai besoin est « je veux un chiffre, pas une explication », la bonne réponse est de brancher le bot sur le moteur déterministe en tant qu'outil. Le modèle comprend la question, appelle le moteur avec les bons paramètres, et restitue son résultat exact plutôt qu'une estimation générée. Le besoin est servi sans que le modèle calcule quoi que ce soit. C'est une évolution d'architecture légitime ; laisser le modèle improviser un chiffre ne l'est pas.",
    ],
  },
};

export default commissionBot;
