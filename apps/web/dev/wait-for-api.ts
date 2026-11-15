// Development only. The target is fixed; no destination comes from browser input.
export async function waitForApi(timeoutMs = 45_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch("http://127.0.0.1:43121/health/ready", {
        signal: AbortSignal.timeout(1000),
        cache: "no-store",
      });
      if (response.ok) return;
    } catch {
      // API compilation/reload may temporarily close its socket.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(
    "A API não ficou pronta em 45 s. Confira os logs de @soe/api, o Docker e as migrações antes de iniciar o web.",
  );
}
