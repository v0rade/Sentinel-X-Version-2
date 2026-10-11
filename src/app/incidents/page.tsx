'use client';

import React, { useEffect, useState } from 'react';
import {
  FolderGit2,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Plus,
  ShieldAlert,
} from 'lucide-react';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  async function fetchIncidents() {
    try {
      const res = await fetch('/api/v1/incidents');
      if (res.ok) {
        const json = await res.json();
        const list = json.data || [];
        setIncidents(list);
        if (list.length > 0 && !selectedIncident) {
          setSelectedIncident(list[0]);
        } else if (selectedIncident) {
          const updated = list.find((i: any) => i.id === selectedIncident.id);
          if (updated) setSelectedIncident(updated);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIncidents();
  }, []);

  async function addNote() {
    if (!newNote.trim() || !selectedIncident) return;
    setSubmittingNote(true);
    try {
      const res = await fetch('/api/v1/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: selectedIncident.id,
          noteToAdd: newNote.trim(),
        }),
      });
      if (res.ok) {
        setNewNote('');
        await fetchIncidents();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingNote(false);
    }
  }

  async function toggleTask(taskId: string, currentStatus: boolean) {
    if (!selectedIncident) return;
    try {
      await fetch('/api/v1/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: selectedIncident.id,
          taskUpdates: [{ taskId, isCompleted: !currentStatus }],
        }),
      });
      await fetchIncidents();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-amber-400" />
          Incident Response Workspace
        </h1>
        <p className="text-xs text-slate-400">
          Orchestrate multi-stage incident containment, forensics, chronological timelines, and checklist tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Incidents List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-xs font-mono text-slate-400 uppercase font-semibold">
            Active Incidents ({incidents.length})
          </div>

          {loading ? (
            <div className="text-xs text-slate-500 font-mono py-8 text-center">Loading incidents...</div>
          ) : (
            incidents.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-[#121c2e] border-cyan-500/60 shadow-lg'
                      : 'bg-[#0d131f] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono text-cyan-400 font-bold">{inc.referenceNumber}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        inc.severity === 'CRITICAL'
                          ? 'badge-critical'
                          : inc.severity === 'HIGH'
                          ? 'badge-high'
                          : 'badge-medium'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-200 line-clamp-1">{inc.title}</h3>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-2">
                    <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      STATUS: {inc.status}
                    </span>
                    <span>{new Date(inc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Incident Detail, Timeline & Task Checklist */}
        <div className="lg:col-span-2 space-y-5">
          {selectedIncident ? (
            <>
              {/* Incident Header Info */}
              <div className="bg-[#0d131f] border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-bold">{selectedIncident.referenceNumber}</span>
                    <h2 className="text-base font-bold text-slate-100">{selectedIncident.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-950/60 border border-amber-800/40 text-amber-300">
                      {selectedIncident.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300">{selectedIncident.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                  <div>
                    <span className="text-slate-500">Affected Assets:</span>{' '}
                    <span className="text-slate-200">{selectedIncident.affectedAssets}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Responder:</span>{' '}
                    <span className="text-slate-200">{selectedIncident.assignedToUser?.name || 'Unassigned'}</span>
                  </div>
                  {selectedIncident.rootCause && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-500">Identified Root Cause:</span>{' '}
                      <span className="text-red-300">{selectedIncident.rootCause}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Response Task Checklist */}
              <div className="bg-[#0d131f] border border-slate-800 rounded-xl p-5">
                <h3 className="text-xs font-bold font-mono uppercase text-slate-300 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Containment &amp; Eradication Checklist
                </h3>
                <div className="space-y-2">
                  {selectedIncident.tasks?.map((task: any) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id, task.isCompleted)}
                      className="flex items-center justify-between p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={task.isCompleted}
                          readOnly
                          className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                        />
                        <span className={`text-xs ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {task.title}
                        </span>
                      </div>
                      {task.isCompleted && (
                        <span className="text-[10px] font-mono text-emerald-400">DONE</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chronological Incident Timeline */}
              <div className="bg-[#0d131f] border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold font-mono uppercase text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" /> Chronological Investigation Timeline
                </h3>

                <div className="space-y-3 relative border-l border-slate-800 ml-3 pl-4">
                  {selectedIncident.timelineEntries?.map((entry: any) => (
                    <div key={entry.id} className="relative space-y-1">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-[#0d131f]" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{entry.title}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{entry.details}</p>
                      <div className="text-[10px] font-mono text-slate-400">
                        By: <span className="text-slate-300">{entry.actorName}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Note Input */}
                <div className="pt-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Log investigative finding or mitigation note..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    onKeyDown={(e) => e.key === 'Enter' && addNote()}
                  />
                  <button
                    onClick={addNote}
                    disabled={submittingNote || !newNote.trim()}
                    className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" /> Log Note
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[#0d131f] border border-slate-800 rounded-xl p-12 text-center text-slate-500 font-mono text-xs">
              Select an incident from the left to view details and timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
