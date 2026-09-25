import { createClient } from "@/lib/supabase/client";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, message: string, code = "error") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const res = await fetch(`${BASE}/api/v1${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = "Request failed";
    let code = `http_${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
      code = body.code ?? code;
    } catch {
      /* non-JSON error */
    }
    throw new ApiError(res.status, detail, code);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
