'use client';

import React, { useEffect, useState } from 'react';
import {
  Flame,
  Search,
  Filter,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({ total: 0, totalPages: 1 });

  async function fetchEvents() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const res = await fetch(`/api/v1/security-events?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setEvents(json.data || []);
        setPagination(json.pagination || { total: 0, totalPages: 1 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, [page, category]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Security Event Telemetry Stream
          </h1>
          <p className="text-xs text-slate-400">
            Real-time normalized SIEM event ingestion stream with tenant isolation, correlation IDs, and actor tracking.
          </p>
        </div>

        {/* Search & Filter */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actor, IP, or resource..."
              className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="">All Categories</option>
            <option value="AUTH_FAILURE">AUTH_FAILURE</option>
            <option value="AUTH_SUCCESS">AUTH_SUCCESS</option>
            <option value="ACCOUNT_LOCKOUT">ACCOUNT_LOCKOUT</option>
            <option value="PRIVILEGE_ESCALATION">PRIVILEGE_ESCALATION</option>
            <option value="API_RATE_LIMIT">API_RATE_LIMIT</option>
          </select>
          <button
            type="submit"
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-semibold"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Events Table */}
      <div className="bg-[#0d131f] border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0a0f19] border-b border-slate-800 text-[11px] text-slate-400 uppercase">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Source IP</th>
                <th className="py-3 px-4">Correlation ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading security events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No events found matching the criteria.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ev.eventCategory.includes('FAILURE') || ev.eventCategory.includes('LOCKOUT')
                            ? 'text-red-400 bg-red-950/60'
                            : ev.eventCategory.includes('ESCALATION')
                            ? 'text-purple-400 bg-purple-950/60'
                            : 'text-emerald-400 bg-emerald-950/60'
                        }`}
                      >
                        {ev.eventCategory}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          ev.severity === 'CRITICAL'
                            ? 'badge-critical'
                            : ev.severity === 'HIGH'
                            ? 'badge-high'
                            : 'badge-medium'
                        }`}
                      >
                        {ev.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200">{ev.actorIdentity || 'anonymous'}</td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-[200px]">
                      {ev.targetResource || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{ev.sourceIp || '10.0.1.x'}</td>
                    <td className="py-3 px-4 text-cyan-400 text-[10px] truncate max-w-[130px]">
                      {ev.correlationId}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-3 border-t border-slate-800 bg-[#0a0f19] flex items-center justify-between text-xs font-mono text-slate-400">
          <span>
            Showing {events.length} of {pagination.total} events
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              Page {page} / {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
