import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AuditLog } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Activity, ShieldCheck, Clock, Layers, CheckCircle2, User } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit-logs');
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionIcon = (action: string) => {
    if (action.includes('AUTH') || action.includes('USER')) {
      return <User size={16} className="text-indigo-600 dark:text-indigo-400" />;
    }
    if (action.includes('PROJECT')) {
      return <Layers size={16} className="text-violet-600 dark:text-violet-400" />;
    }
    return <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Security & Audit Activity Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Immutable trace of project modifications, task state transitions, and user sessions.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck size={16} />
          <span>Audit Guard Active</span>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner fullHeight message="Loading audit logs..." />
      ) : logs.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800">
          <Activity className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Logs Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Activity events will appear here automatically when actions occur.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
          <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {logs.map((log) => {
              let parsedDetails: any = null;
              try {
                if (log.details) parsedDetails = JSON.parse(log.details);
              } catch (e) {
                // Ignore parse errors
              }

              return (
                <div key={log.id} className="relative flex items-start gap-4 pl-8 group">
                  {/* Timeline bullet dot */}
                  <div className="absolute left-2.5 top-1.5 -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 flex items-center justify-center shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  </div>

                  <div className="flex-1 bg-white/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {log.entityType}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {parsedDetails && (
                      <pre className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-600 dark:text-slate-400 overflow-x-auto border border-slate-100 dark:border-slate-800">
                        {JSON.stringify(parsedDetails, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
