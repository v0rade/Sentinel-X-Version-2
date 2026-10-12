import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 font-mono">
      <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-400">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-100">404 - Resource Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm">
        The requested security intelligence or telemetry resource could not be located in this tenancy.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold"
      >
        Return to SOC Dashboard
      </Link>
    </div>
  );
}
