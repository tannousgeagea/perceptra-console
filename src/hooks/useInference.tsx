import { useState } from "react";
import { baseURL } from "@/components/api/base";
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
    selectedModel: { id: number; name: string };
    comparisonModel?: { id: number; name: string };
  }) => {
    if (!file || !selectedModel) {
      setError("Missing required data: file or model.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const primaryUrl = `${baseURL}/api/v1/infer/18?confidence_threshold=${confidenceThreshold}&max_detections=${maxDetections}`;
      const primaryResponse = await fetch(primaryUrl, {
        method: "POST",
        headers: { accept: "application/json" },
        body: formData,
      });

      if (!primaryResponse.ok) {
        throw new Error("Primary model API request failed");
      }

      const primaryData = await primaryResponse.json();
      const responseTimeHeader = primaryResponse.headers.get("x-response-time");
      const primaryProcessingTime = responseTimeHeader ? parseFloat(responseTimeHeader) : 0;
      const primaryPredictions: Prediction[] = primaryData.predictions.map((p: any, i: number) => ({
        id: p.id ?? `pred_${i}`,
        class: p.class_label,
        confidence: p.confidence,
        bbox: {
          x: (p.x / primaryData.width) * 100,
          y: (p.y / primaryData.height) * 100,
          width: (p.width / primaryData.width) * 100,
          height: (p.height / primaryData.height) * 100,
        },
      }));

      const primaryResults: InferenceResult = {
        model: selectedModel.name,
        detections: primaryPredictions.length,
        confidence: primaryPredictions.length > 0 ? primaryPredictions[0].confidence : 0,
        processingTime: primaryProcessingTime, // Simulated
        predictions: primaryPredictions,
      };

      let comparisonResults: InferenceResult | null = null;
      if (comparisonModel) {
        const comparisonFormData = new FormData();
        comparisonFormData.append("file", file);

        const comparisonUrl = `${baseURL}/api/v1/infer/11?confidence_threshold=${confidenceThreshold}&max_detections=${maxDetections}`;
        const comparisonResponse = await fetch(comparisonUrl, {
          method: "POST",
          headers: { accept: "application/json" },
          body: comparisonFormData,
        });

        if (!comparisonResponse.ok) {
          throw new Error("Comparison model API request failed");
        }

        const comparisonData = await comparisonResponse.json();
        const comparisonResponseTimeHeader = comparisonResponse.headers.get("x-response-time");
        const comparisonProcessingTime = comparisonResponseTimeHeader ? parseFloat(comparisonResponseTimeHeader) : 0;

        const comparisonPredictions: Prediction[] = comparisonData.predictions.map((p: any, i: number) => ({
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
          confidence: comparisonPredictions.length > 0 ? comparisonPredictions[0].confidence : 0,
          processingTime: comparisonProcessingTime,
          predictions: comparisonPredictions,
        };
      }

      setResults({
        primary: primaryResults,
        comparison: comparisonResults,
      });

      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsProcessing(false);
      clearInterval(progressInterval);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return {
    runInference,
    isProcessing,
    progress,
    results,
    error,
    setResults, // for manual reset if needed
  };
};
