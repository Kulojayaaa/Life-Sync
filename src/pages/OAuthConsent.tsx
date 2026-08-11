import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FullPageLoader } from "@/components/ui/FullPageLoader";

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};

const oauth = () => (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;

/**
 * Consent screen Supabase redirects to when an MCP client (ChatGPT, Claude,
 * Lovable) asks for access to the signed-in user's LifeSync data.
 */
export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id in the request URL.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = `/auth?next=${encodeURIComponent(next)}`;
        return;
      }
      const { data, error: detailsError } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (detailsError) {
        setError(detailsError.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const api = oauth();
    const { data, error: decideError } = approve
      ? await api.approveAuthorization(authorizationId)
      : await api.denyAuthorization(authorizationId);
    if (decideError) {
      setBusy(false);
      setError(decideError.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Could not load this request</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The authorization request may have expired. Start the connection again from the app
              you were using.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!details) return <FullPageLoader label="Loading authorization request..." />;

  const clientName = details.client?.name ?? "an app";

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <img src="/icon-192.png" alt="LifeSync logo" className="h-10 w-10 rounded-xl" />
            <CardTitle className="text-xl">Connect {clientName}</CardTitle>
          </div>
          <CardDescription>
            {clientName} is requesting access to your LifeSync account. It will be able to read your
            accounts, transactions, bills and goals, and record new transactions as you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" disabled={busy} onClick={() => decide(true)}>
            Approve
          </Button>
          <Button variant="outline" className="w-full" disabled={busy} onClick={() => decide(false)}>
            Deny
          </Button>
          <p className="text-xs text-muted-foreground">
            You can revoke this access at any time from your account settings.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
