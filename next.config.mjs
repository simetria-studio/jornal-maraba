const nextConfig = {
  // Fotos de até 8 MB são enviadas pelo painel via server action (o padrão do Next é 1 MB).
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
};
export default nextConfig;
