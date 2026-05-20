export type QaRunPayload = {
  query: string;
  createdAt: number;
};

const QA_RUN_PREFIX = "qa-run:";

export function createQaRun(query: string): string {
  const runId = createRunId();

  try {
    sessionStorage.setItem(
      `${QA_RUN_PREFIX}${runId}`,
      JSON.stringify({
        query,
        createdAt: Date.now()
      } satisfies QaRunPayload)
    );
  } catch {
    /* sessionStorage may be unavailable in private or restricted contexts. */
  }

  return runId;
}

export function readQaRun(runId: string): QaRunPayload | null {
  if (!runId) return null;

  try {
    const raw = sessionStorage.getItem(`${QA_RUN_PREFIX}${runId}`);
    if (!raw) return null;
    const payload = JSON.parse(raw) as Partial<QaRunPayload>;
    if (!payload.query || typeof payload.query !== "string") return null;

    return {
      query: payload.query,
      createdAt: typeof payload.createdAt === "number" ? payload.createdAt : 0
    };
  } catch {
    return null;
  }
}

function createRunId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
