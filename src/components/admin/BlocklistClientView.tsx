"use client";

import React, { useState } from "react";
import { addBlocklistWordAction, removeBlocklistWordAction } from "@/lib/admin/actions";

interface BlocklistClientViewProps {
  initialBlocklist: string[];
}

export function BlocklistClientView({ initialBlocklist }: BlocklistClientViewProps) {
  const [list, setList] = useState<string[]>(initialBlocklist);
  const [newSlug, setNewSlug] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredList = list.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase().trim()),
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newSlug.trim()) return;

    setLoading(true);
    setError(null);

    const res = await addBlocklistWordAction(newSlug);
    setLoading(false);

    if (res.ok) {
      setList((prev) => [...prev, newSlug.toLowerCase().trim()].sort());
      setNewSlug("");
    } else {
      setError(res.error ?? "Failed to add word.");
    }
  }

  async function handleRemove(slug: string) {
    if (!confirm(`Are you sure you want to remove '${slug}' from the blocklist?`)) return;

    setLoading(true);
    setError(null);

    const res = await removeBlocklistWordAction(slug);
    setLoading(false);

    if (res.ok) {
      setList((prev) => prev.filter((item) => item !== slug));
    } else {
      setError(res.error ?? "Failed to remove word.");
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header & Controls Card */}
        <div className="rounded-[1.6rem] bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-2 text-lg font-bold text-ink">Add Reserved Subdomain</h2>
          <p className="mb-4 text-sm text-ink-soft">
            Subdomains in this list cannot be claimed by users during website publishing.
          </p>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleAdd} className="flex gap-3">
            <input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="e.g. billing, status, static"
              className="flex-1 rounded-xl border border-black/10 px-4 py-2.5 text-sm text-ink focus:border-[#00cf7c] focus:outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newSlug.trim()}
              className="rounded-xl bg-[#00cf7c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00b368] disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Word"}
            </button>
          </form>
        </div>

        {/* List Card */}
        <div className="rounded-[1.6rem] bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-ink">
              Blocked Subdomains ({filteredList.length})
            </h3>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blocklist..."
              className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-ink focus:border-[#00cf7c] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filteredList.map((slug) => (
              <div
                key={slug}
                className="group flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1 text-xs font-medium text-ink transition hover:bg-black/[0.08]"
              >
                <span>{slug}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(slug)}
                  title={`Remove ${slug}`}
                  className="text-black/40 hover:text-red-600"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          {filteredList.length === 0 && (
            <p className="text-center py-6 text-sm text-ink-soft">
              No subdomains found matching &quot;{search}&quot;.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
