
import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/ui/button';
import { useUploadContext } from '@/contexts/UploadContext';
import type { UploadTarget } from '@/types/upload';
import { FileUploader } from '@/components/upload/FileUploader';
import { ImageGrid } from '@/components/upload/ImageGrid';
import Header from '@/components/ui/header/Header';
import { TagInput } from '@/components/upload/TagInput';
import { UploadNotAllowed } from '@/components/upload/UploadNotAllowed';
import { useImageEditPermission } from '@/hooks/useImageEditPermission';

export const UploadPage: React.FC = () => {
  const [tags, setTags] = useState<string[]>([]);
  const { projectId } = useParams<{ projectId: string }>();
  const permission = useImageEditPermission(projectId);

  const description = projectId
    ? "Add images. Uploaded images will be automatically associated with this project."
    : "Add images to your organization’s data lake. You can later assign them to projects.";

  // Where images selected here go. One selection at a time, app-wide: a selection
  // for another project (or the data lake) is finished or cleared first.
  const { pathname } = useLocation();
  const { target, uploadedImages, isProcessing, isUploading, clearAllImages } = useUploadContext();
  const here: UploadTarget = {
    projectId: projectId ?? null,
    label: projectId ? (permission.projectName || 'this project') : 'the data lake',
    path: pathname,
  };
  // A finished selection elsewhere doesn't count: adding files here replaces it.
  const busyElsewhere = !!target && target.projectId !== here.projectId
    && (isProcessing || isUploading || uploadedImages.some((img) => img.status !== 'success'));


  return (
    <div className="space-y-6 p-6 w-full">      
      <Header
        title="Upload Images"
        description={description}
      />
      {permission.isLoading ? null : !permission.canEdit ? (
        <UploadNotAllowed
          inProject={!!projectId}
          projectName={permission.projectName}
          role={projectId ? permission.projectRole : permission.orgRole}
          projectAdmins={permission.projectAdmins}
        />
      ) : busyElsewhere && target ? (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-base font-semibold">
            {isUploading || isProcessing
              ? `Images are still on their way to ${target.label}`
              : `${uploadedImages.length} ${uploadedImages.length === 1 ? 'image is' : 'images are'} selected for ${target.label}`}
          </h2>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            One selection at a time. Finish that one, or clear it to start here.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm"><Link to={target.path}>Go to that upload</Link></Button>
            {!isUploading && !isProcessing && (
              <Button size="sm" variant="outline" onClick={clearAllImages}>Clear it and start here</Button>
            )}
          </div>
        </div>
      ) : (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
          <h2 className="text-lg font-semibold">Select Images</h2>
          <FileUploader target={here} />

          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-md font-medium mb-2 text-gray-900 dark:text-gray-100">
              Add Tags (optional)
            </h3>
            <TagInput tags={tags} onChange={setTags} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <ImageGrid tags={tags} />
        </div>
      </div>
      )}
    </div>
  );
}; 