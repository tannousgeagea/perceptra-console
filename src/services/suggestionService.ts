import { baseURL } from '@/components/api/base';
import type {
  GenerateAISuggestionsRequest,
  SuggestSimilarObjectsRequest,
  SuggestLabelRequest,
  PropagateAnnotationsRequest,
  AcceptSuggestionRequest,
  SuggestionResponse,
  AnnotationSuggestion,
} from '@/types/suggestion';

/**
 * API Service for AI-Assisted Annotation Suggestions
 * 
 * Backend Implementation Guide (FastAPI):
 * ============================================
 * 
 * 1. POST /api/v1/annotations/suggestions/generate-ai
 *    - Accepts: GenerateAISuggestionsRequest
 *    - Returns: SuggestionResponse
 *    - Uses SAM2/SAM3 model to generate bounding box/polygon suggestions
 *    - Should run async (background task) for large images
 * 
 * 2. POST /api/v1/annotations/suggestions/similar-objects
 *    - Accepts: SuggestSimilarObjectsRequest
 *    - Returns: SuggestionResponse
 *    - Uses feature extraction + similarity search (CLIP, ResNet, etc.)
 *    - Finds objects visually similar to source annotation
 * 
 * 3. POST /api/v1/annotations/suggestions/label
 *    - Accepts: SuggestLabelRequest
 *    - Returns: SuggestionResponse with suggested_label populated
 *    - Uses classification model on cropped region
 * 
 * 4. POST /api/v1/annotations/suggestions/propagate
 *    - Accepts: PropagateAnnotationsRequest
 *    - Returns: SuggestionResponse
 *    - Copies annotations from source image to target
 *    - Can optionally use optical flow for position adjustment
 * 
 * 5. POST /api/v1/annotations/suggestions/{suggestion_id}/accept
 *    - Accepts: AcceptSuggestionRequest
 *    - Creates actual annotation from suggestion
 *    - Marks suggestion as accepted
 * 
 * 6. POST /api/v1/annotations/suggestions/{suggestion_id}/reject
 *    - Marks suggestion as rejected
 * 
 * 7. DELETE /api/v1/annotations/suggestions/image/{image_id}
 *    - Clears all pending suggestions for an image
 */

const API_BASE = `${baseURL}/api/v1`;

export const suggestionService = {
  /**
   * Generate AI-powered annotation suggestions using SAM2/SAM3
   */
  async generateAISuggestions(
    request: GenerateAISuggestionsRequest,
    token: string
  ): Promise<SuggestionResponse> {
    const response = await fetch(`${API_BASE}/annotations/suggestions/generate-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to generate AI suggestions');
    }

    return response.json();
  },

  /**
   * Find similar objects in the same image
   */
  async suggestSimilarObjects(
    request: SuggestSimilarObjectsRequest,
    token: string
  ): Promise<SuggestionResponse> {
    const response = await fetch(`${API_BASE}/annotations/suggestions/similar-objects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to suggest similar objects');
    }

    return response.json();
  },

  /**
   * Suggest labels for a user-created annotation
   */
  async suggestLabel(
    request: SuggestLabelRequest,
    token: string
  ): Promise<SuggestionResponse> {
    const response = await fetch(`${API_BASE}/annotations/suggestions/label`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to suggest labels');
    }

    return response.json();
  },

  /**
   * Propagate annotations from previous image
   */
  async propagateAnnotations(
    request: PropagateAnnotationsRequest,
    token: string
  ): Promise<SuggestionResponse> {
    const response = await fetch(`${API_BASE}/annotations/suggestions/propagate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to propagate annotations');
    }

    return response.json();
  },

  /**
   * Accept a suggestion and convert it to annotation
   */
  async acceptSuggestion(
    suggestionId: string,
    request: AcceptSuggestionRequest,
    token: string
  ): Promise<void> {
    const response = await fetch(`${API_BASE}/annotations/suggestions/${suggestionId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to accept suggestion');
    }
  },

  /**
   * Reject a suggestion
   */
  async rejectSuggestion(suggestionId: string, token: string): Promise<void> {
    const response = await fetch(`${API_BASE}/annotations/suggestions/${suggestionId}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to reject suggestion');
    }
  },

  /**
   * Clear all pending suggestions for an image
   */
  async clearSuggestions(imageId: string, token: string): Promise<void> {
    const response = await fetch(`${API_BASE}/annotations/suggestions/image/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to clear suggestions');
    }
  },

  /**
   * Get all pending suggestions for an image
   */
  async getSuggestions(imageId: string, token: string): Promise<AnnotationSuggestion[]> {
    const response = await fetch(`${API_BASE}/annotations/suggestions/image/${imageId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch suggestions');
    }

    const data: SuggestionResponse = await response.json();
    return data.suggestions;
  },
};
