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
}

const listNames = (names: string[]) => {
  const shown = names.slice(0, 3);
  if (shown.length === 1) return shown[0];
  return `${shown.slice(0, -1).join(', ')} or ${shown[shown.length - 1]}`;
};

/** Shown on the Upload page instead of the form when the person can't upload. */
export const UploadNotAllowed: React.FC<UploadNotAllowedProps> = ({
  inProject,
  projectName,
  role,
  projectAdmins = [],
}) => {
  const roleText = role && role !== 'member' ? `Your role is ${role}. ` : '';

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
              ? `You can't upload images to ${projectName || 'this project'}`
              : "You can't upload images to the datalake"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {roleText}
            Uploading needs the editor role or above. To upload, {whoToAsk}.
          </p>
          {!inProject && (
            <p className="text-sm text-muted-foreground">
              You can still upload to projects where you're an editor, from the project's dataset page.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
