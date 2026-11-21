const nextConfig = {
  // Fotos (até 8 MB cada, até 13 por matéria) são enviadas pelo painel via server action (o padrão do Next é 1 MB).
  experimental: { serverActions: { bodySizeLimit: "60mb" } },
};
export default nextConfig;
