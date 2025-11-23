import type {
  CreateSessionRequest,
  SessionResponse,
  SegmentPointsRequest,
  SegmentBoxRequest,
  SegmentTextRequest,
  SegmentExemplarRequest,
  PropagateRequest,
  AcceptSuggestionsRequest,
  RejectSuggestionsRequest,
  SegmentationResponse,
  SAMSession,
  ModelConfig,
} from '@/types/sam';
import { baseURL } from '@/components/api/base';

export const samService = {
  // Session Management
  async createSession(
    projectId: string,
    organizationId: string,
    imageId: string,
    request: CreateSessionRequest,
    token: string
  ): Promise<SessionResponse> {
    const response = await fetch(
      `${baseURL}/api/v1/projects/${projectId}/images/${imageId}/suggestions/session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          "X-Organization-ID": organizationId,
        },
        body: JSON.stringify(request),
      }
    );
    if (!response.ok) throw new Error('Failed to create session');
    return response.json();
  },

  async getSession(
    projectId: string,
    sessionId: string,
    organizationId: string,
    token: string
  ): Promise<SAMSession> {
    const response = await fetch(`${baseURL}/api/v1/projects/${projectId}/suggestions/session/${sessionId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "X-Organization-ID": organizationId,
      },
    });
    if (!response.ok) throw new Error('Failed to get session');
    return response.json();
  },

  async updateSessionModel(
    projectId: string,
    sessionId: string,
    organizationId: string,
    model_config: ModelConfig,
    token: string
  ): Promise<SessionResponse> {
    const response = await fetch(`${baseURL}/api/v1/projects/${projectId}/suggestions/session/${sessionId}/model`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        "X-Organization-ID": organizationId,
      },
      body: JSON.stringify({ model_config }),
    });
    if (!response.ok) throw new Error('Failed to update model');
    return response.json();
  },

  async deleteSession(
    projectId: string,
    sessionId: string,
    organizationId: string, 
    token: string
  ): Promise<void> {
    console.log("ProjectId: ", projectId)
    const response = await fetch(`${baseURL}/api/v1/projects/${projectId}/suggestions/session/${sessionId}`, {
      method: 'DELETE',
      headers: { 
        Authorization: `Bearer ${token}`,
        "X-Organization-ID": organizationId,
      },
    });
    if (!response.ok) throw new Error('Failed to delete session');
  },

  // Segmentation Operations
  async segmentWithPoints(
    request: SegmentPointsRequest,
    organizationId: string,
    token: string
  ): Promise<SegmentationResponse> {
    const response = await fetch(`${baseURL}/api/v1/suggestions/segment/points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        "X-Organization-ID": organizationId,
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to segment with points');
    return response.json();
  },

  async segmentWithBox(
    request: SegmentBoxRequest,
    organizationId: string,
    token: string
  ): Promise<SegmentationResponse> {
    const response = await fetch(`${baseURL}/api/v1/suggestions/segment/box`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        "X-Organization-ID": organizationId,
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to segment with box');
    return response.json();
  },

  async segmentWithText(
    request: SegmentTextRequest,
    organizationId: string,
    token: string
  ): Promise<SegmentationResponse> {
    const response = await fetch(`${baseURL}/api/v1/suggestions/segment/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        "X-Organization-ID": organizationId,
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to segment with text');
    return response.json();
  },

  async segmentWithExemplar(
    request: SegmentExemplarRequest,
    organizationId: string,
    token: string
  ): Promise<SegmentationResponse> {
    const response = await fetch(`${baseURL}/api/v1/suggestions/segment/exemplar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        "X-Organization-ID": organizationId,
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to segment with exemplar');
    return response.json();
  },

  async propagateAnnotations(
    request: PropagateRequest,
    organizationId: string,
    token: string
  ): Promise<SegmentationResponse> {
    const response = await fetch(`${baseURL}/api/v1/suggestions/propagate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        "X-Organization-ID": organizationId,
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to propagate annotations');
    return response.json();
  },

  // Accept/Reject
  async acceptSuggestions(
    sessionId: string,
    request: AcceptSuggestionsRequest,
    organizationId: string,
    token: string
  ): Promise<void> {
    const response = await fetch(
      `${baseURL}/api/v1/suggestions/session/${sessionId}/accept`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          "X-Organization-ID": organizationId,
        },
        body: JSON.stringify(request),
      }
    );
    if (!response.ok) throw new Error('Failed to accept suggestions');
  },

  async rejectSuggestions(
    sessionId: string,
    request: RejectSuggestionsRequest,
    organizationId: string,
    token: string
  ): Promise<void> {
    const response = await fetch(
      `${baseURL}/api/v1/suggestions/session/${sessionId}/reject`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          "X-Organization-ID": organizationId,
        },
        body: JSON.stringify(request),
      }
    );
    if (!response.ok) throw new Error('Failed to reject suggestions');
  },
};
