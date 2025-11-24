import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { samService } from '@/services/samService';
import { useAuthHelpers, getAccessToken } from './useAuthHelpers';
import { useCurrentOrganization } from './useAuthHelpers';
import { toast } from 'sonner';
import type {
  SAMModel,
  DeviceType,
  PrecisionType,
  ModelConfig,
  SAMSuggestion,
  Point,
  BBox,
} from '@/types/sam';

export const useSAMSession = (projectId: string, imageId: string) => {
  const queryClient = useQueryClient();
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    model: 'sam_v2',
    device: 'cuda',
    precision: 'fp16',
  });
  const [suggestions, setSuggestions] = useState<SAMSuggestion[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const { currentOrganization } = useCurrentOrganization();
  if (!currentOrganization) throw new Error("No organization selected");

  // Create session
  const createSession = useMutation({
    mutationFn: async (config?: ModelConfig) => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');
      const configToUse = config || modelConfig;
      return samService.createSession(
        projectId,
        currentOrganization.id,
        imageId,
        { config: configToUse },
        token
      );
    },
    onSuccess: (data) => {
      setSessionId(data.session_id);
      setModelConfig(data.config);
      toast.success(`AI Session started with ${data.config.model.toUpperCase()}`);
    },
    onError: () => {
      toast.error('Failed to start AI session');
    },
  });

  // Get session status
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ['sam-session', sessionId],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token || !sessionId) throw new Error('No session');
      return samService.getSession(projectId, sessionId, currentOrganization.id, token);
    },
    enabled: !!sessionId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'processing' ? 1000 : false;
    },
  });

  // Update model
  const switchModel = useMutation({
    mutationFn: async (newConfig: ModelConfig) => {
      const token = await getAccessToken();
      if (!token || !sessionId) throw new Error('No session');
      return samService.updateSessionModel(projectId, sessionId, currentOrganization.id, newConfig, token);
    },
    onSuccess: (data) => {
      setModelConfig(data.config);
      setSuggestions([]);
      setPoints([]);
      toast.success('Model switched successfully');
    },
    onError: () => {
      toast.error('Failed to switch model');
    },
  });

  // Segment with points
  const segmentWithPoints = useMutation({
    mutationFn: async (pointsToSegment: Point[]) => {
      const token = await getAccessToken();
      if (!token || !sessionId) throw new Error('No session');
      return samService.segmentWithPoints(
        projectId,
        imageId,
        { session_id: sessionId, points: pointsToSegment },
        currentOrganization.id,
        token
      );
    },
    onSuccess: (data) => {
      setSuggestions((prev) => [...prev, ...data.suggestions]);
      toast.success(`Generated ${data.count} suggestions`);
    },
    onError: () => {
      toast.error('Failed to segment with points');
    },
  });

  // Segment with box
  const segmentWithBox = useMutation({
    mutationFn: async (box: BBox) => {
      const token = await getAccessToken();
      if (!token || !sessionId) throw new Error('No session');
      return samService.segmentWithBox(
        projectId,
        imageId,
        { session_id: sessionId, box }, 
        currentOrganization.id, token
      );
    },
    onSuccess: (data) => {
      setSuggestions((prev) => [...prev, ...data.suggestions]);
      toast.success('Box refined with AI');
    },
    onError: () => {
      toast.error('Failed to refine box');
    },
  });

  // Segment with text
  const segmentWithText = useMutation({
    mutationFn: async (text: string) => {
      const token = await getAccessToken();
      if (!token || !sessionId) throw new Error('No session');
      return samService.segmentWithText(
        projectId,
        imageId,
        { session_id: sessionId, text }, currentOrganization.id, token);
    },
    onSuccess: (data) => {
      setSuggestions((prev) => [...prev, ...data.suggestions]);
      toast.success(`Found ${data.count} objects`);
    },
    onError: () => {
      toast.error('Failed to find objects');
    },
  });

  // Segment similar
  const segmentSimilar = useMutation({
    mutationFn: async (referenceAnnotationUid: string) => {
      const token = await getAccessToken();
      if (!token || !sessionId) throw new Error('No session');
      return samService.segmentWithExemplar(
        projectId,
        imageId,
        { session_id: sessionId, reference_annotation_uid: referenceAnnotationUid },
        currentOrganization.id,
        token
      );
    },
    onSuccess: (data) => {
      setSuggestions((prev) => [...prev, ...data.suggestions]);
      toast.success(`Found ${data.count} similar objects`);
    },
    onError: () => {
      toast.error('Failed to find similar objects');
    },
  });

  // Propagate from previous
  const propagateFromPrevious = useMutation({
    mutationFn: async ({
      sourceImageId,
      annotationUids,
    }: {
      sourceImageId: string;
      annotationUids: string[];
    }) => {
      const token = await getAccessToken();
      if (!token || !sessionId) throw new Error('No session');
      return samService.propagateAnnotations(
        projectId,
        imageId,
        {
          session_id: sessionId,
          source_image_id: sourceImageId,
          annotation_uids: annotationUids,
        },
        currentOrganization.id,
        token
      );
    },
    onSuccess: (data) => {
      setSuggestions((prev) => [...prev, ...data.suggestions]);
      toast.success(`Propagated ${data.count} annotations`);
    },
    onError: () => {
      toast.error('Failed to propagate annotations');
    },
  });

  // Accept suggestions
  const acceptSuggestions = useMutation({
    mutationFn: async ({
      suggestionIds,
      classId,
      className,
    }: {
      suggestionIds: string[];
      classId?: string;
      className?: string;
    }) => {
      const token = await getAccessToken();
      if (!token || !sessionId) throw new Error('No session');
      await samService.acceptSuggestions(
        sessionId,
        { suggestion_ids: suggestionIds, class_id: classId, class_name: className },
        currentOrganization.id,
        token
      );
    },
    onSuccess: (_, variables) => {
      setSuggestions((prev) =>
        prev.filter((s) => !variables.suggestionIds.includes(s.id))
      );
      toast.success('Suggestions accepted');
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
    },
    onError: () => {
      toast.error('Failed to accept suggestions');
    },
  });

  // Reject suggestions
  const rejectSuggestions = useMutation({
    mutationFn: async (suggestionIds: string[]) => {
      const token = await getAccessToken();
      if (!token || !sessionId) throw new Error('No session');
      await samService.rejectSuggestions(
        sessionId,
        { suggestion_ids: suggestionIds },
        currentOrganization.id,
        token
      );
    },
    onSuccess: (_, suggestionIds) => {
      setSuggestions((prev) => prev.filter((s) => !suggestionIds.includes(s.id)));
      toast.success('Suggestions rejected');
    },
    onError: () => {
      toast.error('Failed to reject suggestions');
    },
  });

  // Add point
  const addPoint = useCallback((point: Point) => {
    setPoints((prev) => [...prev, point]);
  }, []);

  // Clear points
  const clearPoints = useCallback(() => {
    setPoints([]);
  }, []);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  // End session
  const endSession = useCallback(async () => {
    if (!sessionId) return;
    const token = await getAccessToken();
    if (!token) return;
    
    try {
      await samService.deleteSession(projectId, sessionId, currentOrganization.id, token);
      setSessionId(null);
      setSuggestions([]);
      setPoints([]);
      toast.info('AI session ended');
    } catch (error) {
      toast.error('Failed to end session');
    }
  }, [sessionId, getAccessToken]);

  return {
    // Session state
    sessionId,
    session,
    isSessionActive: !!sessionId && session?.status === 'ready',
    isSessionLoading,
    modelConfig,
    
    // Data
    suggestions,
    points,
    
    // Actions
    createSession: createSession.mutate,
    switchModel: switchModel.mutate,
    segmentWithPoints: segmentWithPoints.mutate,
    segmentWithBox: segmentWithBox.mutate,
    segmentWithText: segmentWithText.mutate,
    segmentSimilar: segmentSimilar.mutate,
    propagateFromPrevious: (sourceImageId: string, annotationIds: string[]) => 
      propagateFromPrevious.mutate({ sourceImageId, annotationUids: annotationIds }),
    acceptSuggestions: acceptSuggestions.mutate,
    rejectSuggestions: rejectSuggestions.mutate,
    addPoint,
    clearPoints,
    clearSuggestions,
    endSession,
    
    // Loading states
    isProcessing:
      createSession.isPending ||
      switchModel.isPending ||
      segmentWithPoints.isPending ||
      segmentWithBox.isPending ||
      segmentWithText.isPending ||
      segmentSimilar.isPending ||
      propagateFromPrevious.isPending ||
      session?.status === 'processing',
  };
};
