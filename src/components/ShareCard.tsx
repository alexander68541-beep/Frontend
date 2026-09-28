"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { usePortfolio } from "@/lib/hooks";
import { portfolioUrl } from "@/lib/urls";

export function ShareCard() {
  const portfolio = usePortfolio();
  const [copied, setCopied] = useState(false);
  const username = portfolio.data?.username;
  if (!username) return null;
  const url = portfolioUrl(username);

  function copy() {
    navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }

  return (
    <div className="card share-card">
      <div className="share-qr"><QRCodeSVG value={url} size={104} bgColor="transparent" fgColor="#ffffff" level="M" /></div>
      <div className="share-info">
        <h2 className="card-title">Share your portfolio</h2>
        <p className="muted small">Scan the QR code or copy your link.</p>
        <div className="row gap-2 wrap mt-3">
          <code className="pay-value" style={{ flex: 1, minWidth: 180 }}>{url}</code>
          <button className="btn btn-sm" onClick={copy}>{copied ? "Copied ✓" : "Copy"}</button>
          <a className="btn btn-sm" href={url} target="_blank" rel="noreferrer">Open ↗</a>
        </div>
      </div>
    </div>
  );
}
