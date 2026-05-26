const OWNER_CONSOLE_ENABLED_VALUES = new Set(['1', 'true', 'yes']);

export function isOwnerConsoleEnabled(): boolean {
  const runtimeEnv =
    typeof process === 'undefined'
      ? {}
      : (process.env as Record<string, string | undefined>);

  return OWNER_CONSOLE_ENABLED_VALUES.has(
    (
      runtimeEnv.PREDICTA_ENABLE_OWNER_CONSOLE ??
      runtimeEnv.PRIDICTA_ENABLE_OWNER_CONSOLE ??
      ''
    )
      .trim()
      .toLowerCase(),
  );
}

export function ownerConsoleUnavailableResponse(): Response {
  return Response.json(
    {
      detail:
        'Owner tools are not available in this public build. Please use the protected owner environment.',
    },
    {
      status: 404,
    },
  );
}
