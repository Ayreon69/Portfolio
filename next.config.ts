import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Le prototype vit dans un sous-dossier avec son propre package.json et son
  // propre node_modules. Sans cette borne, Turbopack remonte chercher une
  // racine de projet et tombe sur le package-lock.json du dossier utilisateur.
  turbopack: { root: __dirname },
};

export default nextConfig;
