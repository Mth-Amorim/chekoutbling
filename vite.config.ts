import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBase = env.VITE_API_BASE ?? "http://localhost:52534";
  const appPort = Number(env.APP_PORT ?? 8080);

  return {
    server: {
      host: "::",
      port: appPort,
      allowedHosts: [
        'uzeapi-frontend-poel8n-4f78ff-187-77-35-239.traefik.me',
        'box-check-joy.uzenails.com.br',
        'checkout.uzenails.com.br'
      ],
      hmr: {
        overlay: false,
      },
      proxy: {
        "/api": {
          target: apiBase,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean,
    ),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    },
  };
});
