// Client-side mirror of the backend rules. UX only — the server is authoritative.
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;

const PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeUsername(raw: string): string {
  return (raw ?? "").trim().toLowerCase();
}

export function validateUsername(raw: string): string | null {
  const name = normalizeUsername(raw);
  if (!name) return "Username is required.";
  if (name.length < USERNAME_MIN) return `At least ${USERNAME_MIN} characters.`;
  if (name.length > USERNAME_MAX) return `At most ${USERNAME_MAX} characters.`;
  if (!PATTERN.test(name))
    return "Use lowercase letters, numbers and single hyphens only.";
  return null;
}
