
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/ui/tabs';
import { EmptyState } from './results/EmptyState';
import { ResultStats } from './results/ResultStats';
import { ResultsHeader } from './results/ResultsHeader';
import { MediaDisplay } from './results/MediaDisplay';

interface ResultsViewerProps {
  results: any;
  uploadedFile: File | null;
  isComparisonMode: boolean;
}

export const ResultsViewer: React.FC<ResultsViewerProps> = ({
  results,
  uploadedFile,
  isComparisonMode
}) => {
  const [showOverlay, setShowOverlay] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('primary');

  if (!results || !uploadedFile) {
    return <EmptyState />;
  }

  const imageUrl = URL.createObjectURL(uploadedFile);
  const isVideo = uploadedFile.type.startsWith('video/');

  // Check if we have valid results for both primary and comparison (if in comparison mode)
  const hasPrimaryResults = results.primary;
  const hasComparisonResults = results.comparison;
  const canShowComparison = isComparisonMode && hasComparisonResults;

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="space-y-6">
        <ResultsHeader 
          showOverlay={showOverlay}
          onToggleOverlay={() => setShowOverlay(!showOverlay)}
        />

        {isComparisonMode ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="primary" disabled={!hasPrimaryResults}>Primary Model</TabsTrigger>
              <TabsTrigger value="comparison" disabled={!hasComparisonResults}>Comparison Model</TabsTrigger>
              <TabsTrigger value="side-by-side" disabled={!hasPrimaryResults || !hasComparisonResults}>Side by Side</TabsTrigger>
            </TabsList>
            
            <TabsContent value="primary" className="space-y-4">
              {hasPrimaryResults ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <MediaDisplay
                      imageUrl={imageUrl}
                      isVideo={isVideo}
                      showOverlay={showOverlay}
                      overlayType="primary"
                      maxHeight='max-h-[800px]'
                      predictions={results.primary.predictions}
                    />
                  </div>
                  <div>
                    <ResultStats data={results.primary} title="Primary Results" />
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 p-8">
                  <p>No primary results available</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="comparison" className="space-y-4">
              {hasComparisonResults ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <MediaDisplay
                      imageUrl={imageUrl}
                      isVideo={isVideo}
                      showOverlay={showOverlay}
                      overlayType="comparison"
                      maxHeight='max-h-[800px]'
                      predictions={results.comparison.predictions}
                    />
                  </div>
                  <div>
                    <ResultStats data={results.comparison} title="Comparison Results" />
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 p-8">
                  <p>No comparison results available. Run inference with a comparison model to see results here.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="side-by-side" className="space-y-4">
              {hasPrimaryResults && hasComparisonResults ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <MediaDisplay
                      imageUrl={imageUrl}
                      isVideo={isVideo}
                      showOverlay={showOverlay}
                      overlayType="side-by-side"
                      title={results.primary.model}
                      maxHeight="max-h-92"
                      predictions={results.primary.predictions}
                    />
                    
                    <MediaDisplay
                      imageUrl={imageUrl}
                      isVideo={isVideo}
                      showOverlay={showOverlay}
                      overlayType="side-by-side"
                      title={results.comparison.model}
                      maxHeight="max-h-92"
                      predictions={results.comparison.predictions}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ResultStats data={results.primary} title="Primary Model Stats" />
                    <ResultStats data={results.comparison} title="Comparison Model Stats" />
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 p-8">
                  <p>Both primary and comparison results are needed for side-by-side view.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MediaDisplay
                imageUrl={imageUrl}
                isVideo={isVideo}
                showOverlay={showOverlay}
                overlayType="primary"
                maxHeight='max-h-[800px]'
                predictions={results.primary.predictions}
              />
            </div>
            <div>
              <ResultStats data={results.primary} title="Inference Results" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};