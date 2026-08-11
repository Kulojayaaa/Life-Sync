/** Shared helpers so every tool returns MCP content in the same shape. */
export function ok(payload: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload as Record<string, unknown>,
  };
}

export function fail(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

export function requireAuth(ctx: { isAuthenticated: () => boolean }) {
  return ctx.isAuthenticated()
    ? null
    : fail("Not authenticated. Connect this MCP server with your LifeSync account.");
}
