import React from 'react';
import { Lock } from 'lucide-react';

interface UploadNotAllowedProps {
  /** Set when uploading into a project; omitted for the datalake. */
  inProject: boolean;
  projectName?: string;
  /** The role that blocks them: project role in a project, org role otherwise. */
  role: string;
  /** Project admins who can change their project role. */
  projectAdmins?: string[];
  /** What the page does: upload files, or link files already in storage. */
  action?: 'upload' | 'link';
}

const listNames = (names: string[]) => {
  const shown = names.slice(0, 3);
  if (shown.length === 1) return shown[0];
  return `${shown.slice(0, -1).join(', ')} or ${shown[shown.length - 1]}`;
};

/** Shown on the Upload and Link pages instead of the form when the person can't add images. */
export const UploadNotAllowed: React.FC<UploadNotAllowedProps> = ({
  inProject,
  projectName,
  role,
  projectAdmins = [],
  action = 'upload',
}) => {
  const roleText = role && role !== 'member' ? `Your role is ${role}. ` : '';
  const verb = action === 'link' ? 'link' : 'upload';
  const Verb = action === 'link' ? 'Linking' : 'Uploading';

  const whoToAsk = inProject
    ? projectAdmins.length > 0
      ? `ask ${listNames(projectAdmins)} for the editor role in this project`
      : 'ask a project admin or an organization admin for the editor role in this project'
    : 'ask an organization admin for the editor role';

  return (
    <div className="rounded-lg border border-border bg-card p-6 sm:p-8 max-w-2xl">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            {inProject
              ? `You can't ${verb} images to ${projectName || 'this project'}`
              : `You can't ${verb} images to the datalake`}
          </h2>
          <p className="text-sm text-muted-foreground">
            {roleText}
            {Verb} needs the editor role or above. To {verb}, {whoToAsk}.
          </p>
          {!inProject && (
            <p className="text-sm text-muted-foreground">
              You can still {verb} images to projects where you're an editor, from the project's menu.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
