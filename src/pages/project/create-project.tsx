
import React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";

import { useNavigation } from "@/hooks/useNavigation";
import { ValidationErrors } from "@/components/project/ValidationError";
import { AnnotationGroupForm } from "@/components/project/AnnotationGroupFrom"
import { SuccessModal } from "@/components/project/SucceeModal";
import { AnnotationGroup, ProjectResponse, ProjectCreateData } from "@/types/project";
import { useProjectOptions, useProjectFormValidation, useCreateProject } from "@/hooks/useCreateProject";
import { ArrowLeft, Loader2, Settings, Save, AlertCircle, Plus, X } from "lucide-react";


const CreateProject: React.FC = () => {
  const { projectTypes, visibilityOptions } = useProjectOptions();
  const { validateProjectData, isValidProjectData } = useProjectFormValidation();
  const { goBack } = useNavigation();

  // React Query hook with callbacks
  const { 
    createProject, 
    isLoading, 
    isSuccess, 
    isError, 
    error, 
    data, 
    reset 
  } = useCreateProject({
    onSuccess: (data: ProjectResponse) => {
      console.log('Project created successfully:', data);
    },
    onError: (error: any) => {
      console.error('Failed to create project:', error);
    }
  });

  const [formData, setFormData] = useState<ProjectCreateData>({
    name: '',
    description: '',
    thumbnail_url: '',
    project_type_name: 'object-detection',
    visibility_name: 'private',
    organization_id: undefined,
    annotation_groups: [{
      name: 'Default Group',
      description: '',
      classes: [{
        class_id: 0,
        name: '',
        color: '#3B82F6'
      }]
    }]
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  // Memoize form validation to prevent unnecessary re-renders
  const currentValidationErrors = useMemo(() => {
    return validateProjectData(formData);
  }, [formData, validateProjectData]);

  // Validate form data when it changes
  useEffect(() => {
    setValidationErrors(currentValidationErrors);
  }, [currentValidationErrors]);

  // Check if form has unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    return formData.name.trim() !== '' || 
           formData.description?.trim() !== '' ||
           formData.annotation_groups.some(group => 
             group.name.trim() !== '' || 
             group.classes.some(cls => cls.name.trim() !== '')
           );
  }, [formData]);

  // Handle navigation back with confirmation if needed
  const handleGoBack = useCallback(() => {
    if (hasUnsavedChanges() && !isLoading) {
      setShowExitConfirmation(true);
    } else {
      goBack();
    }
  }, [hasUnsavedChanges, isLoading, goBack]);

  const confirmExit = useCallback(() => {
    setShowExitConfirmation(false);
    goBack();
  }, [goBack]);

  const cancelExit = useCallback(() => {
    setShowExitConfirmation(false);
  }, []);

  // Validate form data when it changes
  useEffect(() => {
    const errors = validateProjectData(formData);
    setValidationErrors(errors);
  }, [formData, validateProjectData]);

  const addAnnotationGroup = useCallback(() => {
    const newGroup: AnnotationGroup = {
      name: '',
      description: '',
      classes: [{
        class_id: 0,
        name: '',
        color: '#3B82F6'
      }]
    };
    setFormData({
      ...formData,
      annotation_groups: [...formData.annotation_groups, newGroup]
    });
  }, [formData]);

  const updateAnnotationGroup = useCallback((index: number, groupData: AnnotationGroup) => {
    const updatedGroups = formData.annotation_groups.map((group, i) => 
      i === index ? groupData : group
    );
    setFormData({ ...formData, annotation_groups: updatedGroups });
  }, [formData]);

  const removeAnnotationGroup = useCallback((index: number) => {
    const updatedGroups = formData.annotation_groups.filter((_, i) => i !== index);
    setFormData({ ...formData, annotation_groups: updatedGroups });
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    const errors = validateProjectData(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    createProject(formData);
  }, [formData, validateProjectData, createProject]);

  const handleReset = useCallback(() => {
    reset();
    setValidationErrors([]);
  }, [reset]);

  const canSubmit = useMemo(() => 
    isValidProjectData(formData) && !isLoading, 
    [formData, isValidProjectData, isLoading]
  );

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-indigo-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleGoBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
                <p className="text-gray-600 text-sm">Set up your project configuration and annotation classes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGoBack}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isLoading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {isError && error && (
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-800">Error Creating Project</h4>
              <p className="text-red-700 text-sm mt-1">
                {error.message || 'An unexpected error occurred'}
              </p>
              {error.status_code && (
                <p className="text-red-600 text-xs mt-1">
                  Error code: {error.status_code}
                </p>
              )}
            </div>
            <button
              onClick={handleReset}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Validation Errors */}
          <ValidationErrors errors={validationErrors} />

          {/* Basic Information */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter project name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Type *
                </label>
                <select
                  value={formData.project_type_name}
                  onChange={(e) => setFormData({ ...formData, project_type_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  {projectTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Visibility *
                </label>
                <div className="flex gap-4">
                  {visibilityOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value={option.value}
                        checked={formData.visibility_name === option.value}
                        onChange={(e) => setFormData({ ...formData, visibility_name: e.target.value })}
                        className="text-indigo-600 focus:ring-indigo-500"
                        disabled={isLoading}
                      />
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Annotation Groups */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Annotation Groups</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Define the classes and groups for your annotations
                </p>
              </div>
              <button
                type="button"
                onClick={addAnnotationGroup}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Group
              </button>
            </div>

            <div className="space-y-6">
              {formData.annotation_groups.map((group, index) => (
                <AnnotationGroupForm
                  key={index}
                  groupData={group}
                  onChange={(data) => updateAnnotationGroup(index, data)}
                  onRemove={() => removeAnnotationGroup(index)}
                  canRemove={formData.annotation_groups.length > 1}
                />
              ))}
            </div>
          </div>

          {/* Form Summary */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Project Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <p className="font-medium text-gray-900 truncate">
                  {formData.name || 'Not set'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Type:</span>
                <p className="font-medium text-gray-900">
                  {projectTypes.find(t => t.value === formData.project_type_name)?.label}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Groups:</span>
                <p className="font-medium text-gray-900">
                  {formData.annotation_groups.length}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Total Classes:</span>
                <p className="font-medium text-gray-900">
                  {formData.annotation_groups.reduce((sum, group) => sum + group.classes.length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccess}
        onClose={() => {
          handleReset();
          // Navigate to projects list or the created project
          console.log('Navigate to project or projects list');
        }}
        project={data}
      />


      {/* Exit Confirmation Modal */}
      {showExitConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Unsaved Changes</h3>
                <p className="text-sm text-gray-600">You have unsaved changes that will be lost.</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to leave without saving your project?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={cancelExit}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Stay and Continue
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Leave Without Saving
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Creating your project...</p>
            <p className="text-gray-500 text-sm mt-1">This may take a moment</p>
            <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-indigo-600 h-full w-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProject;