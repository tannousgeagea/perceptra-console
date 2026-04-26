import React from 'react';
import { ModelSelector } from '@/components/inference/ModelSelector';
import { ParameterControls } from '@/components/inference/ParameterControls';
import { FileUpload } from '@/components/inference/FileUpload';
import { ResultsViewer } from '@/components/inference/ResultsViewer';
import { Header } from '@/components/inference/Header';
import { Sidebar } from '@/components/inference/Sidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/ui/select';
import { useUserProjects } from '@/hooks/useUserProjects';
import { ModelItem } from '@/types/models';

const Inference = () => {
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('');
  const [selectedModel, setSelectedModel] = React.useState<ModelItem | null>(null);
  const [comparisonModel, setComparisonModel] = React.useState<ModelItem | null>(null);
  const [parameters, setParameters] = React.useState({
    confidence: 0.5,
    iou: 0.5,
    maxDetections: 100,
  });
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [results, setResults] = React.useState(null);
  const [isComparisonMode, setIsComparisonMode] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const { data: projects = [], isLoading: projectsLoading } = useUserProjects();

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedModel(null);
    setComparisonModel(null);
  };

  return (
    <div className="w-full min-h-screen transition-all duration-300 bg-[var(--mtx-bg)] text-[var(--mtx-text)]">
      <Header
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isComparisonMode={isComparisonMode}
        setIsComparisonMode={setIsComparisonMode}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar>
          <div className="px-1 pb-3">
            <label className="text-sm font-medium text-muted-foreground block mb-1">
              Project
            </label>
            <Select
              value={selectedProjectId}
              onValueChange={handleProjectChange}
              disabled={projectsLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a project…" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.project_id} value={p.project_id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ModelSelector
            projectId={selectedProjectId || undefined}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            comparisonModel={comparisonModel}
            setComparisonModel={setComparisonModel}
            isComparisonMode={isComparisonMode}
          />

          <ParameterControls
            parameters={parameters}
            setParameters={setParameters}
            selectedModel={selectedModel}
          />
        </Sidebar>

        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <FileUpload
              uploadedFile={uploadedFile}
              setUploadedFile={setUploadedFile}
              selectedModel={selectedModel}
              parameters={parameters}
              setResults={setResults}
              isComparisonMode={isComparisonMode}
              comparisonModel={comparisonModel}
            />

            <ResultsViewer
              results={results}
              uploadedFile={uploadedFile}
              isComparisonMode={isComparisonMode}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Inference;
