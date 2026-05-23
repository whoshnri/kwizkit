export type StoredLiveAttempt = {
  attemptId: string;
  email: string;
  studentName: string;
  verifiedAt: string;
};

export function readStoredLiveAttempt(testSlug: string): StoredLiveAttempt | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(`liveAttempt:${testSlug}`);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredLiveAttempt;
    if (!parsed.attemptId || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearStoredLiveAttempt(testSlug: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(`liveAttempt:${testSlug}`);
}
