import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicBackendUrl = "https://evdqvwqruclcdxbeztnd.supabase.co";
  const publicBackendKey = "sb_publishable_Ov76koic42myiXF3PgAXWw_a8_91nRK";
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || publicBackendUrl;
  const supabasePublishableKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    env.SUPABASE_ANON_KEY ||
    publicBackendKey;

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      {
        name: "inject-public-backend-env",
        transformIndexHtml(html: string) {
          if (!supabaseUrl || !supabasePublishableKey) return html;

          return html.replace(
            "<head>",
            `<head>\n    <script>window.__ENV=${JSON.stringify({
              VITE_SUPABASE_URL: supabaseUrl,
              VITE_SUPABASE_PUBLISHABLE_KEY: supabasePublishableKey,
            })};</script>`,
          );
        },
      },
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabasePublishableKey),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(supabasePublishableKey),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
