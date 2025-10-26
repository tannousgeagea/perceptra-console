// hooks/useCreateProject.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner'; 

import { ProjectCreateData, ProjectResponse } from '@/types/project';
import { baseURL } from '@/components/api/base';
import { authStorage } from "@/services/authService";
import { AUTH_STORAGE_KEYS } from "@/types/auth";
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { organizations } from '@/components/users/mockData';

export interface ApiError {
  detail: string;
  status_code?: number;
}

// API Service
class ProjectApiService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async createProject(data: ProjectCreateData, organizationId: string): Promise<ProjectResponse> {
    // ✅ Get token using new auth storage
    const token = authStorage.get(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    
    if (!token) {
      throw new ApiError('No authentication token found. Please log in.', 401);
    }

    const response = await fetch(`${this.baseUrl}/api/v1/projects/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Organization-ID': organizationId,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: `HTTP error! status: ${response.status}`,
      }));
      
      throw new ApiError(
        errorData.detail || `Request failed with status ${response.status}`,
        response.status
      );
    }

    return response.json();
  }
}

// Custom Error Class
export class ApiError extends Error {
  public status_code?: number;

  constructor(message: string, status_code?: number) {
    super(message);
    this.name = 'ApiError';
    this.status_code = status_code;
  }
}

// Initialize service
const projectApi = new ProjectApiService(baseURL);

// Query Keys Factory
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: number) => [...projectKeys.details(), id] as const,
};

// Hook Options Interface
export interface UseCreateProjectOptions {
  onSuccess?: (data: ProjectResponse) => void;
  onError?: (error: ApiError) => void;
  onSettled?: (data: ProjectResponse | undefined, error: ApiError | null) => void;
  enableToasts?: boolean;
  invalidateQueries?: boolean;
}

// Main Hook
export const useCreateProject = (options: UseCreateProjectOptions = {}) => {
  const queryClient = useQueryClient();

  // ✅ Get current organization from auth context
  const { currentOrganization } = useCurrentOrganization();
  
  console.log(currentOrganization)
  const {
    onSuccess,
    onError,
    onSettled,
    enableToasts = true,
    invalidateQueries = true,
  } = options;

  const mutation = useMutation<ProjectResponse, ApiError, ProjectCreateData>({
    mutationFn: (data: ProjectCreateData) => {
      // ✅ Ensure organization is selected
      if (!currentOrganization) {
        throw new ApiError('No organization selected. Please select an organization.', 400);
      }
      
      return projectApi.createProject(data, currentOrganization.id);
    },
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch projects list
      if (invalidateQueries) {
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
        queryClient.invalidateQueries({ queryKey: projectKeys.all });
      }

      // Add the new project to cache
      queryClient.setQueryData(projectKeys.detail(data.id), data);

      // Show success toast
      if (enableToasts) {
        toast.success(`Project "${data.name}" created successfully!`, {
          duration: 4000,
          icon: '🎉',
        });
      }

      // Call custom success handler
      onSuccess?.(data);
    },

    onError: (error, variables, context) => {
      // Show error toast
      if (enableToasts) {
        toast.error(error.message || 'Failed to create project', {
          duration: 5000,
          icon: '❌',
        });
      }

      // Log error for debugging
      console.error('Project creation failed:', error);

      // Call custom error handler
      onError?.(error);
    },

    onSettled: (data, error, variables, context) => {
      // Call custom settled handler
      onSettled?.(data, error);
    },
  });

  return {
    // Mutation methods
    createProject: mutation.mutate,
    createProjectAsync: mutation.mutateAsync,
    reset: mutation.reset,
    
    // State
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    
    // Status
    status: mutation.status,
    
    // Additional utilities
    isIdle: mutation.status === 'idle',
  };
};

// Additional Hook for Form Validation
export const useProjectFormValidation = () => {
  const validateProjectData = useCallback((data: ProjectCreateData): string[] => {
    const errors: string[] = [];

    // Basic validation
    if (!data.name?.trim()) {
      errors.push('Project name is required');
    }

    if (data.name && (data.name.length < 1 || data.name.length > 255)) {
      errors.push('Project name must be between 1 and 255 characters');
    }

    if (!data.project_type_name) {
      errors.push('Project type is required');
    }

    if (!data.visibility_name) {
      errors.push('Visibility setting is required');
    }

    // Validate annotation groups
    if (!data.annotation_groups || data.annotation_groups.length === 0) {
      errors.push('At least one annotation group is required');
    }

    data.annotation_groups?.forEach((group, groupIndex) => {
      if (!group.name?.trim()) {
        errors.push(`Annotation group ${groupIndex + 1} name is required`);
      }

      if (group.name && (group.name.length < 1 || group.name.length > 255)) {
        errors.push(`Annotation group ${groupIndex + 1} name must be between 1 and 255 characters`);
      }

      if (!group.classes || group.classes.length === 0) {
        errors.push(`Annotation group ${groupIndex + 1} must have at least one class`);
      }

      group.classes?.forEach((cls, classIndex) => {
        if (!cls.name?.trim()) {
          errors.push(`Class ${classIndex + 1} in group ${groupIndex + 1} name is required`);
        }

        if (cls.name && (cls.name.length < 1 || cls.name.length > 255)) {
          errors.push(`Class ${classIndex + 1} in group ${groupIndex + 1} name must be between 1 and 255 characters`);
        }

        if (cls.color && !/^#[0-9A-Fa-f]{6}$/.test(cls.color)) {
          errors.push(`Class ${classIndex + 1} in group ${groupIndex + 1} has invalid color format`);
        }
      });
    });

    return errors;
  }, []);


const isValidProjectData = useCallback((data: ProjectCreateData): boolean => {
  return validateProjectData(data).length === 0;
}, [validateProjectData]);

  return {
    validateProjectData,
    isValidProjectData,
  };
};

// Hook for Project Types and Options (if you need to fetch these)
export const useProjectOptions = () => {
  const projectTypes = [
    { value: 'object-detection', label: 'Object Detection', icon: '📦' },
    { value: 'classification', label: 'Classification', icon: '🏷️' },
    { value: 'segmentation', label: 'Segmentation', icon: '✂️' }
  ];

  const visibilityOptions = [
    { value: 'private', label: 'Private', icon: '🔒' },
    { value: 'public', label: 'Public', icon: '🌐' }
  ];

  const defaultColors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308',
    '#84CC16', '#22C55E', '#10B981', '#14B8A6',
    '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'
  ];

  return {
    projectTypes,
    visibilityOptions,
    defaultColors,
  };
};