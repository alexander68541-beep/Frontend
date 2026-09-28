"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";

interface Dns { type: string; name: string; value: string; }
interface Dom { id: string; domain: string; verified: boolean; dns: Dns[]; url: string; }
interface Resp { configured: boolean; domains: Dom[]; }

export default function DomainsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["domains"], queryFn: () => apiFetch<Resp>("/portfolio/domains"), refetchInterval: 20000 });
  const [domain, setDomain] = useState("");

  const add = useMutation({
    mutationFn: () => apiFetch<Dom>("/portfolio/domains", { method: "POST", body: JSON.stringify({ domain }) }),
    onSuccess: () => { setDomain(""); qc.invalidateQueries({ queryKey: ["domains"] }); },
  });
  const refresh = useMutation({
    mutationFn: (id: string) => apiFetch(`/portfolio/domains/${id}/refresh`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["domains"] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/portfolio/domains/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["domains"] }),
  });
  const addErr = add.error instanceof ApiError ? add.error.message : null;

  if (q.isLoading) return <p className="muted">Loading…</p>;
  const configured = q.data?.configured ?? false;
  const domains = q.data?.domains ?? [];

  return (
    <div className="stack gap-6">
      <div><h1 className="page-title">Custom domain</h1><p className="muted">Connect your own domain to your portfolio — free, with automatic HTTPS.</p></div>

      {!configured ? (
        <div className="card muted">Custom domains aren&apos;t enabled on this server yet. Please check back soon.</div>
      ) : (
        <>
          <div className="card">
            <h2 className="card-title">Add a domain</h2>
            <p className="muted small">Enter a domain you own (e.g. <code>yourname.com</code> or <code>portfolio.yourname.com</code>).</p>
            {addErr && <div className="alert alert-error mt-3">{addErr}</div>}
            <div className="row gap-2 wrap mt-4">
              <input className="input" style={{ flex: 1, minWidth: 220 }} value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yourname.com" />
              <Button variant="accent" loading={add.isPending} disabled={!domain.trim()} onClick={() => add.mutate()}>Add domain</Button>
            </div>
          </div>

          {domains.map((d) => (
            <div key={d.id} className="card">
              <div className="row between wrap gap-2">
                <div className="row gap-2" style={{ alignItems: "center" }}>
                  <strong style={{ fontSize: 16 }}>{d.domain}</strong>
                  <span className={`badge ${d.verified ? "badge-published" : "badge-draft"}`}><span className="dot" />{d.verified ? "Connected" : "Pending DNS"}</span>
                </div>
                <div className="row gap-2 wrap">
                  {d.verified && <a className="btn btn-sm" href={d.url} target="_blank" rel="noreferrer">Visit ↗</a>}
                  <button className="btn btn-sm" disabled={refresh.isPending} onClick={() => refresh.mutate(d.id)}>Re-check</button>
                  <button className="btn btn-sm btn-danger" onClick={() => { if (confirm(`Remove ${d.domain}?`)) remove.mutate(d.id); }}>Remove</button>
                </div>
              </div>
              {!d.verified && (
                <div className="mt-4">
                  <p className="muted small">At your domain registrar (GoDaddy, Namecheap, Cloudflare…), add this DNS record, then click <strong>Re-check</strong>. It can take a few minutes to a few hours.</p>
                  <div className="table-wrap mt-3"><table className="tbl">
                    <thead><tr><th>Type</th><th>Name</th><th>Value</th></tr></thead>
                    <tbody>{d.dns.map((r, i) => (
                      <tr key={i}><td>{r.type}</td><td><code>{r.name}</code></td><td><code>{r.value}</code></td></tr>
                    ))}</tbody>
                  </table></div>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
