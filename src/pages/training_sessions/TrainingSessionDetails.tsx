import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'react-router-dom';
import SessionDetail from '@/components/training_sessions/SessionDetails';
import SessionHeader from '@/components/training_sessions/SessionHeader';
import { Loader2 } from 'lucide-react';
import { useTrainingSessionDetail } from '@/hooks/useTrainingSessionDetail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/ui/tabs";
import ValidationImages from '@/components/validation/ValidationImages';
import ConfigurationLogs from '@/components/training_sessions/ConfigurationLogs';
import { useValidationImages } from "@/hooks/useValidationImages";
import ValidationMetricsCharts from '@/components/validation/ValidationMetricsCharts';
import { useValidationMetrics } from '@/hooks/useValidationMetrics';

const SessionDetailPage: React.FC = () => {
  const { projectId, sessionId } = useParams<{ projectId: string, sessionId: string }>();

  const {
    data: session,
    isLoading,
    isError,
    error,
    refetch,
  } = useTrainingSessionDetail(sessionId || '');

  const modelVersionId = session?.model_version?.id;
  const {
    data: validationData,
    isLoading: imagesLoading,
    isError: imagesError,
    error: imagesErrorMsg,
  } = useValidationImages(modelVersionId, 100, 0);


  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useValidationMetrics(modelVersionId);
  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="animate-spin mr-2 h-5 w-5" />
        Loading session...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 py-10 text-center">
        Error: {(error as Error).message}
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Session with ID {sessionId} not found</p>
          <Link to="/" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to sessions list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 w-full sm:px-6 lg:px-8 py-8">
      <SessionHeader session={session} projectId={projectId || ''}/>
      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="metrics">Training Metrics</TabsTrigger>
            <TabsTrigger value="validation">Validation Curves</TabsTrigger>
            <TabsTrigger value="images">Validation Images</TabsTrigger>
            <TabsTrigger value="logs">Logs & Config</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          <SessionDetail session={session} />
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          {metricsLoading ? (
            <div className="flex items-center justify-center text-muted-foreground">
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Loading validation metrics...
            </div>
          ): metricsError ? (
            <div className="text-red-500 text-center">
              {(metricsError as Error).message}
            </div>
          ) : metrics ? (
            <ValidationMetricsCharts metricsData={metrics} />
          ) : null}
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          {imagesLoading ? (
            <div className="flex items-center justify-center text-muted-foreground">
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Loading validation images...
            </div>
          ) : imagesError ? (
            <div className="text-red-500 text-center">
              {(imagesErrorMsg as Error).message}
            </div>
          ) : (
            <ValidationImages 
              validationImages={validationData?.results || []} 
              modelVersionId={modelVersionId}
              onValidationComplete={() => refetch()}
            />
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <ConfigurationLogs session={session}  />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SessionDetailPage;