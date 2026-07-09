import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || "";
  const supabasePublishableKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    env.SUPABASE_ANON_KEY ||
    "";

  if (mode === "production" && (!supabaseUrl || !supabasePublishableKey)) {
    // Fail the build rather than shipping a bundle that crashes at load.
    throw new Error(
      "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY — set them in .env before building.",
    );
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      {
        name: "inject-runtime-env",
        transformIndexHtml(html: string) {
          if (!supabaseUrl || !supabasePublishableKey) return html;
          // Exposes the same public keys at runtime so self-hosted builds can
          // override them by defining window.__ENV before the app script.
          return html.replace(
            "<head>",
            `<head>\n    <script>window.__ENV=window.__ENV||${JSON.stringify({
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
