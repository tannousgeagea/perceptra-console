import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { suggestionService } from '@/services/suggestionService';
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { toast } from 'sonner';
import type {
  AnnotationSuggestion,
  GenerateAISuggestionsRequest,
  SuggestSimilarObjectsRequest,
  SuggestLabelRequest,
  PropagateAnnotationsRequest,
} from '@/types/suggestion';

export const useSuggestions = (imageId: string, projectId: string) => {
  const queryClient = useQueryClient();
  const [pendingSuggestions, setPendingSuggestions] = useState<AnnotationSuggestion[]>([]);

  // Fetch suggestions for current image
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['suggestions', imageId],
    queryFn: async () => {
      const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) throw new Error('Not authenticated');
      return suggestionService.getSuggestions(imageId, token);
    },
    enabled: !!imageId,
  });

  // Generate AI suggestions
  const generateAI = useMutation({
    mutationFn: async (request: Omit<GenerateAISuggestionsRequest, 'image_id' | 'project_id'>) => {
      const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) throw new Error('Not authenticated');
      return suggestionService.generateAISuggestions(
        { ...request, image_id: imageId, project_id: projectId },
        token
      );
    },
    onSuccess: (data) => {
      toast.success(`Generated ${data.count} AI suggestions`);
      queryClient.invalidateQueries({ queryKey: ['suggestions', imageId] });
    },
    onError: () => {
      toast.error('Failed to generate AI suggestions');
    },
  });

  // Suggest similar objects
  const suggestSimilar = useMutation({
    mutationFn: async (sourceAnnotationId: string) => {
      const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) throw new Error('Not authenticated');
      return suggestionService.suggestSimilarObjects(
        { image_id: imageId, project_id: projectId, source_annotation_id: sourceAnnotationId },
        token
      );
    },
    onSuccess: (data) => {
      toast.success(`Found ${data.count} similar objects`);
      queryClient.invalidateQueries({ queryKey: ['suggestions', imageId] });
    },
    onError: () => {
      toast.error('Failed to find similar objects');
    },
  });

  // Suggest label for annotation
  const suggestLabel = useMutation({
    mutationFn: async (request: Omit<SuggestLabelRequest, 'image_id' | 'project_id'>) => {
      const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) throw new Error('Not authenticated');
      return suggestionService.suggestLabel(
        { ...request, image_id: imageId, project_id: projectId },
        token
      );
    },
    onSuccess: (data) => {
      toast.success('Label suggestions generated');
      queryClient.invalidateQueries({ queryKey: ['suggestions', imageId] });
    },
    onError: () => {
      toast.error('Failed to suggest labels');
    },
  });

  // Propagate from previous image
  const propagate = useMutation({
    mutationFn: async (sourceImageId: string) => {
      const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) throw new Error('Not authenticated');
      return suggestionService.propagateAnnotations(
        {
          source_image_id: sourceImageId,
          target_image_id: imageId,
          project_id: projectId,
        },
        token
      );
    },
    onSuccess: (data) => {
      toast.success(`Propagated ${data.count} annotations`);
      queryClient.invalidateQueries({ queryKey: ['suggestions', imageId] });
    },
    onError: () => {
      toast.error('Failed to propagate annotations');
    },
  });

  // Accept suggestion
  const acceptSuggestion = useMutation({
    mutationFn: async ({
      suggestionId,
      classId,
      className,
    }: {
      suggestionId: string;
      classId?: string;
      className?: string;
    }) => {
      const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) throw new Error('Not authenticated');
      await suggestionService.acceptSuggestion(
        suggestionId,
        { suggestion_id: suggestionId, class_id: classId, class_name: className },
        token
      );
    },
    onSuccess: () => {
      toast.success('Suggestion accepted');
      queryClient.invalidateQueries({ queryKey: ['suggestions', imageId] });
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
    },
    onError: () => {
      toast.error('Failed to accept suggestion');
    },
  });

  // Reject suggestion
  const rejectSuggestion = useMutation({
    mutationFn: async (suggestionId: string) => {
      const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) throw new Error('Not authenticated');
      await suggestionService.rejectSuggestion(suggestionId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions', imageId] });
    },
    onError: () => {
      toast.error('Failed to reject suggestion');
    },
  });

  // Clear all suggestions
  const clearSuggestions = useMutation({
    mutationFn: async () => {
      const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) throw new Error('Not authenticated');
      await suggestionService.clearSuggestions(imageId, token);
    },
    onSuccess: () => {
      toast.success('All suggestions cleared');
      queryClient.invalidateQueries({ queryKey: ['suggestions', imageId] });
    },
    onError: () => {
      toast.error('Failed to clear suggestions');
    },
  });

  return {
    suggestions,
    isLoading,
    generateAI: generateAI.mutate,
    suggestSimilar: suggestSimilar.mutate,
    suggestLabel: suggestLabel.mutate,
    propagate: propagate.mutate,
    acceptSuggestion: acceptSuggestion.mutate,
    rejectSuggestion: rejectSuggestion.mutate,
    clearSuggestions: clearSuggestions.mutate,
    isGenerating: generateAI.isPending || suggestSimilar.isPending || propagate.isPending,
  };
};
