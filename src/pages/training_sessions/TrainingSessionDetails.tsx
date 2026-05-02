import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertTriangle, BarChart2, Activity, ImageIcon, FileText } from 'lucide-react';
import { useTrainingSessionDetail } from '@/hooks/useTrainingSessionDetail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/ui/tabs';
import SessionHeader from '@/components/training_sessions/SessionHeader';
import SessionDetail from '@/components/training_sessions/SessionDetails';
import ConfigurationLogs from '@/components/training_sessions/ConfigurationLogs';
import ValidationImages from '@/components/validation/ValidationImages';
import ValidationMetricsCharts from '@/components/validation/ValidationMetricsCharts';
import { useValidationImages } from '@/hooks/useValidationImages';
import { useValidationMetrics } from '@/hooks/useValidationMetrics';

const SessionDetailPage: React.FC = () => {
  const { projectId, sessionId } = useParams<{ projectId: string; sessionId: string }>();

  const {
    data: session,
    isLoading,
    isError,
    error,
    refetch,
  } = useTrainingSessionDetail(sessionId ?? '');

  const modelVersionId = session?.model_version?.id;

  const {
    data: validationData,
    isLoading: imagesLoading,
    isError: imagesError,
    error: imagesErrorMsg,
  } = useValidationImages(modelVersionId, 100, 0);

  const {
    data: valMetrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useValidationMetrics(modelVersionId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500 dark:text-gray-400">
        <Loader2 className="animate-spin h-6 w-6 mr-3" />
        <span>Loading training session…</span>
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/60 p-8">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
            Session not found
          </h2>
          <p className="text-sm text-red-600 dark:text-red-400 mb-6">
            {isError
              ? (error as Error).message
              : `Session ${sessionId} could not be loaded.`}
          </p>
          <Link
            to={`/projects/${projectId}/sessions`}
            className="inline-flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sessions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 mx-auto">
      <SessionHeader session={session} projectId={projectId ?? ''} />

      <Tabs defaultValue="metrics" className="space-y-5">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="metrics" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm">
            <BarChart2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Training</span> Metrics
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm">
            <Activity className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Validation</span> Curves
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm">
            <ImageIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Val</span> Images
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm">
            <FileText className="h-3.5 w-3.5" />
            Logs &amp; Config
          </TabsTrigger>
        </TabsList>

        {/* Training Metrics + Epoch Loop */}
        <TabsContent value="metrics" className="space-y-5">
          <SessionDetail session={session} />
        </TabsContent>

        {/* Validation Curves */}
        <TabsContent value="validation" className="space-y-5">
          {metricsLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Loading validation metrics…
            </div>
          ) : metricsError ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(metricsError as Error).message}
                </p>
              </div>
            </div>
          ) : valMetrics ? (
            <ValidationMetricsCharts metricsData={valMetrics} />
          ) : (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              No validation metrics available for this version.
            </div>
          )}
        </TabsContent>

        {/* Validation Images */}
        <TabsContent value="images" className="space-y-5">
          {imagesLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Loading validation images…
            </div>
          ) : imagesError ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(imagesErrorMsg as Error).message}
                </p>
              </div>
            </div>
          ) : (
            <ValidationImages
              validationImages={validationData?.results ?? []}
              modelVersionId={modelVersionId}
              onValidationComplete={() => refetch()}
            />
          )}
        </TabsContent>

        {/* Logs & Config */}
        <TabsContent value="logs" className="space-y-5">
          <ConfigurationLogs session={session} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SessionDetailPage;
