import { apiFetch } from '@/services/apiClient';
import { AnnotationClass } from "@/contexts/ClassesContext";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";

export type DeleteClassChoice =
  | { annotations: 'move'; moveTo: number }
  | { annotations: 'delete' };

export interface DeleteClassResult {
  success: boolean;
  message: string;
  moved: number;
  deleted: number;
}

// API error class
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// Generic fetch function with error handling
const fetchApi = async <T>(
  endpoint: string, 
  options?: RequestInit
): Promise<T> => {
  try {

    const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

    if (!token) {
      throw new Error("No authentication token found");
    }
    const response = await apiFetch(`${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options?.headers,
      }
    });
    
    if (!response.ok) {
      // The API's own sentence ("'pallet' is used by 12 annotations…") beats the status text.
      const body = await response.json().catch(() => null);
      const detail = typeof body?.detail === 'string' ? body.detail : `API error: ${response.statusText}`;
      throw new ApiError(detail, response.status);
    }
    
    return await response.json();
  } catch (error) {
    console.error("API error:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Unknown error occurred",
      500
    );
  }
};

// Classes API
export const classesApi = {
  // Get all classes
  getClasses: async (organizationId:string, projectId: string): Promise<AnnotationClass[]> => {
    return fetchApi<AnnotationClass[]>(`/api/v1/projects/${projectId}/classes`, {
      headers: {
        "X-Organization-ID": organizationId,
      }
    });
  },
  
  // Create a new class
  createClass: async (
    organizationId:string,
    projectId: string, 
    classData: Omit<AnnotationClass, "id">
  ): Promise<AnnotationClass> => {
    return fetchApi<AnnotationClass>(`/api/v1/projects/${projectId}/classes`, {
      method: "POST",
      body: JSON.stringify(classData),
      headers: {
        "X-Organization-ID": organizationId,
      }
    });
  },
  
  // Update an existing class
  updateClass: async (
    organizationId: string, 
    projectId: string,  
    class_id: string, 
    updates: Partial<AnnotationClass>
  ): Promise<AnnotationClass> => {
    return fetchApi<AnnotationClass>(`/api/v1/projects/${projectId}/classes/${class_id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
      headers: {
        "X-Organization-ID": organizationId,
      }
    });
  },
  
  // Delete a class. A class in use needs a choice: move its annotations to
  // another class (moveTo = that class's classId) or delete them with it.
  deleteClass: async (
    organizationId: string,
    projectId: string,
    class_id: string,
    choice?: DeleteClassChoice
  ): Promise<DeleteClassResult> => {
    const params = new URLSearchParams();
    if (choice) {
      params.set('annotations', choice.annotations);
      if (choice.annotations === 'move') params.set('move_to', String(choice.moveTo));
    }
    const query = params.toString() ? `?${params}` : '';
    return fetchApi<DeleteClassResult>(`/api/v1/projects/${projectId}/classes/${class_id}${query}`, {
      method: "DELETE",
      headers: {
        "X-Organization-ID": organizationId,
      }
    });
  }
};