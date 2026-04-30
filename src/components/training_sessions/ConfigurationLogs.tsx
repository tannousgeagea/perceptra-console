import React, { useRef, useEffect, useState } from 'react';
import { TrainingSession } from '@/types/training_session';
import { AlertTriangle, ChevronDown, ChevronUp, Settings, Terminal, Copy, Check } from 'lucide-react';

interface ConfigurationLogsProps {
  session: TrainingSession | undefined;
}

function formatConfigKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function formatConfigValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value === null || value === undefined) return '—';
  return String(value);
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
};

const ConfigurationLogs: React.FC<ConfigurationLogsProps> = ({ session }) => {
  const logEndRef = useRef<HTMLDivElement>(null);
  const [showFullTrace, setShowFullTrace] = useState(false);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.logs?.length]);

  if (!session) return null;

  const hasConfig = session.configuration && Object.keys(session.configuration).length > 0;
  const hasLogs = session.logs && session.logs.length > 0;
  const hasFailed = session.status === 'failed';

  return (
    <div className="space-y-6">
      {/* Error Details (if failed) */}
      {hasFailed && session.errorMessage && (
        <div className="rounded-xl border border-red-200 dark:border-red-800/60 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800/40">
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
              Failure Details
            </h3>
          </div>
          <div className="px-5 py-4 bg-white dark:bg-gray-900">
            <p className="text-sm text-red-700 dark:text-red-400 mb-3">{session.errorMessage}</p>

            {session.errorTraceback && (
              <>
                <button
                  onClick={() => setShowFullTrace((s) => !s)}
                  className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline font-medium mb-3"
                >
                  {showFullTrace ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  {showFullTrace ? 'Hide traceback' : 'Show full traceback'}
                </button>

                {showFullTrace && (
                  <div className="relative">
                    <div className="absolute top-2 right-2">
                      <CopyButton text={session.errorTraceback} />
                    </div>
                    <pre className="bg-gray-950 dark:bg-black text-red-300 font-mono text-xs p-4 rounded-lg overflow-x-auto whitespace-pre-wrap break-all max-h-96">
                      {session.errorTraceback}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Configuration */}
      {hasConfig && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            <Settings className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Training Configuration
            </h3>
          </div>
          <div className="p-5 bg-white dark:bg-gray-900">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(session.configuration!).map(([key, value]) => (
                <div
                  key={key}
                  className="flex flex-col gap-0.5 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                >
                  <span className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">
                    {formatConfigKey(key)}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 font-mono">
                    {formatConfigValue(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logs */}
      {hasLogs ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-gray-950 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-300">
                Training Logs
                <span className="ml-2 text-xs text-gray-500 font-normal">
                  {session.logs!.length} lines
                </span>
              </h3>
            </div>
            <CopyButton text={session.logs!.join('\n')} />
          </div>
          <div className="bg-gray-950 font-mono text-xs h-72 overflow-y-auto p-4 space-y-0.5">
            {session.logs!.map((line, i) => {
              const isError = line.toLowerCase().includes('error') || line.toLowerCase().includes('traceback');
              const isWarn = line.toLowerCase().includes('warn');
              const isSuccess = line.toLowerCase().includes('completed') || line.toLowerCase().includes('best');

              return (
                <div
                  key={i}
                  className={`flex gap-3 group hover:bg-gray-900 px-1 rounded ${
                    isError
                      ? 'text-red-400'
                      : isWarn
                      ? 'text-amber-400'
                      : isSuccess
                      ? 'text-green-400'
                      : 'text-gray-300'
                  }`}
                >
                  <span className="select-none text-gray-700 w-8 text-right flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="whitespace-pre-wrap break-all">{line}</span>
                </div>
              );
            })}
            <div ref={logEndRef} />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Terminal className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {session.status === 'pending' || session.status === 'queued'
              ? 'Logs will appear here once training starts.'
              : 'No logs are available for this session.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ConfigurationLogs;
