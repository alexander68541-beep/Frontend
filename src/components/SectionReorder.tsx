"use client";

import { useEffect } from "react";

// Reorders the public portfolio's sections (tagged with data-sec) to match the
// owner's chosen order. Template-agnostic: works for any layout where the
// sections are siblings.
export function SectionReorder({ order }: { order?: string[] }) {
  useEffect(() => {
    if (!order || order.length === 0) return;
    const secs = Array.from(document.querySelectorAll<HTMLElement>("[data-sec]"));
    if (secs.length < 2) return;
    const parent = secs[0].parentElement;
    if (!parent) return;
    const rank = new Map(order.map((k, i) => [k, i]));
    const sorted = [...secs].sort(
      (a, b) => (rank.get(a.dataset.sec || "") ?? 999) - (rank.get(b.dataset.sec || "") ?? 999),
    );
    const firstIdx = Array.from(parent.children).indexOf(secs[0]);
    secs.forEach((s) => s.remove());
    const ref = (parent.children[firstIdx] as HTMLElement) || null;
    sorted.forEach((s) => parent.insertBefore(s, ref));
  }, [order]);
  return null;
}
