import { useState } from "react";
import { apiFetch } from "@/services/apiClient";
import { InferenceResult, InferenceState, Prediction, UseInferenceOptions } from "@/types/inference";

export const useInference = ({ confidenceThreshold, maxDetections = 100 }: UseInferenceOptions) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<InferenceState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runInference = async ({
    file,
    selectedModel,
    comparisonModel,
  }: {
    file: File | null;
    selectedModel: { id: string; name: string; version_id?: string };
    comparisonModel?: { id: string; name: string; version_id?: string };
  }) => {
    if (!file || !selectedModel) {
      setError("Missing required data: file or model.");
      return;
    }

    const primaryVersionId = selectedModel.version_id ?? selectedModel.id;
    if (!primaryVersionId) {
      setError("Selected model has no deployed version.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return Math.min(prev + Math.random() * 20, 90);
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const primaryResponse = await apiFetch(
        `/api/v1/infer/${primaryVersionId}?confidence_threshold=${confidenceThreshold}&max_detections=${maxDetections}`,
        { method: "POST", body: formData }
      );

      if (!primaryResponse.ok) {
        throw new Error(`Inference failed: ${primaryResponse.statusText}`);
      }

      const primaryData = await primaryResponse.json();
      const primaryProcessingTime = parseFloat(
        primaryResponse.headers.get("x-response-time") ?? "0"
      );

      const primaryPredictions: Prediction[] = (primaryData.predictions ?? []).map(
        (p: any, i: number) => ({
          id: p.id ?? `pred_${i}`,
          class: p.class_label,
          confidence: p.confidence,
          bbox: {
            x: (p.x / primaryData.width) * 100,
            y: (p.y / primaryData.height) * 100,
            width: (p.width / primaryData.width) * 100,
            height: (p.height / primaryData.height) * 100,
          },
        })
      );

      const primaryResults: InferenceResult = {
        model: selectedModel.name,
        detections: primaryPredictions.length,
        confidence: primaryPredictions[0]?.confidence ?? 0,
        processingTime: primaryProcessingTime,
        predictions: primaryPredictions,
      };

      let comparisonResults: InferenceResult | null = null;

      if (comparisonModel?.version_id) {
        const comparisonFormData = new FormData();
        comparisonFormData.append("file", file);

        const comparisonResponse = await apiFetch(
          `/api/v1/infer/${comparisonModel.version_id}?confidence_threshold=${confidenceThreshold}&max_detections=${maxDetections}`,
          { method: "POST", body: comparisonFormData }
        );

        if (comparisonResponse.ok) {
          const comparisonData = await comparisonResponse.json();
          const comparisonPredictions: Prediction[] = (
            comparisonData.predictions ?? []
          ).map((p: any, i: number) => ({
            id: p.id ?? `pred_${i}`,
            class: p.class_label,
            confidence: p.confidence,
            bbox: {
              x: (p.x / comparisonData.width) * 100,
              y: (p.y / comparisonData.height) * 100,
              width: (p.width / comparisonData.width) * 100,
              height: (p.height / comparisonData.height) * 100,
            },
          }));

          comparisonResults = {
            model: comparisonModel.name,
            detections: comparisonPredictions.length,
            confidence: comparisonPredictions[0]?.confidence ?? 0,
            processingTime: parseFloat(
              comparisonResponse.headers.get("x-response-time") ?? "0"
            ),
            predictions: comparisonPredictions,
          };
        }
      }

      setResults({ primary: primaryResults, comparison: comparisonResults });
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsProcessing(false);
      clearInterval(progressInterval);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return { runInference, isProcessing, progress, results, error, setResults };
};
