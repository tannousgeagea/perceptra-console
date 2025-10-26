import { AnnotationClass } from "@/contexts/ClassesContext";

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
    const API_URL = import.meta.env.VITE_API_URL || "https://api.example.com";
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
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
  getClasses: async (projectId: string): Promise<AnnotationClass[]> => {
    // Temporary mock response until actual API is connected
    // return [
    //   { id: '1', name: 'O', color: '#3B82F6', count: 2 },
    //   { id: '2', name: 'brewa-ek109', color: '#EC4899', count: 1 },
    //   { id: '3', name: 'g2-agr', color: '#06B6D4', count: 2 },
    //   { id: '4', name: 'g3-tirme-bottom', color: '#FACC15', count: 1 },
    //   { id: '5', name: 'g3-tirme-top', color: '#2DD4BF', count: 1 },
    //   { id: '6', name: 'g3-top-amk', color: '#F97316', count: 2 },
    //   { id: '7', name: 'g4-gml', color: '#8B5CF6', count: 1 },
    //   { id: '8', name: 'g6-gml', color: '#EF4444', count: 1 },
    //   { id: '9', name: 'roi', color: '#A3E635', count: 0 },
    // ];
    // For real API implementation, uncomment below:
    return fetchApi<AnnotationClass[]>(`/api/v1/classes?project_id=${projectId}`);
  },
  
  // Create a new class
  createClass: async (projectId: string, classData: Omit<AnnotationClass, "id">): Promise<AnnotationClass> => {
    // const newClass = {
    //   ...classData,
    //   id: Date.now().toString(),
    // };
    // return newClass;
    // For real API implementation, uncomment below:
    return fetchApi<AnnotationClass>(`/api/v1/classes?project_id=${projectId}`, {
      method: "POST",
      body: JSON.stringify(classData),
    });
  },
  
  // Update an existing class
  updateClass: async (id: string, updates: Partial<AnnotationClass>): Promise<AnnotationClass> => {
    // Temp mock response
    // In a real implementation, this would call the API
    // const mockClass = {
    //   id,
    //   name: updates.name || "Updated Class",
    //   color: updates.color || "#000000",
    //   count: 0
    // };
    // return mockClass;
    // For real API implementation, uncomment below:
    return fetchApi<AnnotationClass>(`/api/v1/classes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },
  
  // Delete a class
  deleteClass: async (id: string): Promise<void> => {
    // Mock success response
    // return Promise.resolve();
    // For real API implementation, uncomment below:
    return fetchApi<void>(`/api/v1/classes/${id}`, {
      method: "DELETE",
    });
  }
};