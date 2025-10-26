import React from "react";
import { TrainingSession } from "@/types/training_session";

interface ConfigurationLogsProps {
  session: TrainingSession | undefined;
}

const ConfigurationLogs: React.FC<ConfigurationLogsProps> = ({ session }) => {
    if (!session) return null
    
    return (
        <div className="space-y-6">
          {session.configuration && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                  {Object.entries(session.configuration).map(([key, value]) => (
                    <div key={key} className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {session.logs && session.logs.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Logs</h3>
              <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
                {session.logs.map((log, index) => (
                  <div key={index} className="py-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
    );
};

export default ConfigurationLogs