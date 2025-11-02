import { AnnotationClass } from "@/contexts/ClassesContext";
import { baseURL } from "../api/base";
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";

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
    const response = await fetch(`${baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options?.headers,
      }
    });
    
    if (!response.ok) {
      throw new ApiError(
        `API error: ${response.statusText}`,
        response.status
      );
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
  
  // Delete a class
  deleteClass: async (
    organizationId: string, 
    projectId: string,  
    class_id: string,
    hard_delete: boolean = false
  ): Promise<void> => {
    const queryParam = hard_delete ? "?hard=true" : "";
    return fetchApi<void>(`/api/v1/projects/${projectId}/classes/${class_id}${queryParam}`, {
      method: "DELETE",
      headers: {
        "X-Organization-ID": organizationId,
      }
    });
  }
};