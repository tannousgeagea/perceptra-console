// components/dataset/OpenInAnnotator.tsx
//
// "Annotate" action on a dataset image: opens it in the annotator inside its
// job (a menu when the image is in several jobs, plain annotator when in none).

import React from 'react';
import { ChevronDown, Loader2, PenSquare } from 'lucide-react';
import { Button } from '@/components/ui/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/ui/dropdown-menu';
import { ImageJob, useOpenInAnnotator } from '@/hooks/useOpenInAnnotator';

interface OpenInAnnotatorProps {
  projectId: string;
  imageId: string;
  jobs?: ImageJob[];
  size?: 'sm' | 'default' | 'icon';
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  className?: string;
}

export const OpenInAnnotator: React.FC<OpenInAnnotatorProps> = ({
  projectId, imageId, jobs = [], size = 'sm', variant = 'secondary', className,
}) => {
  const { open, opening } = useOpenInAnnotator(projectId);
  const busy = opening === imageId;
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  const icon = busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenSquare className="h-4 w-4" />;
  const label = size === 'icon' ? null : <span className="ml-1">Annotate</span>;

  if (jobs.length <= 1) {
    const job = jobs[0];
    return (
      <Button
        size={size}
        variant={variant}
        className={className}
        disabled={busy}
        title={job ? `Open in annotator — job "${job.name}"` : 'Open in annotator (not in a job)'}
        onClick={(e) => { stop(e); open(imageId, job); }}
      >
        {icon}{label}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={stop}>
        <Button size={size} variant={variant} className={className} disabled={busy} title="Open in annotator">
          {icon}{label}{size !== 'icon' && <ChevronDown className="h-3 w-3 ml-1" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={stop}>
        <DropdownMenuLabel>Open in job</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {jobs.map((job) => (
          <DropdownMenuItem key={job.id} onSelect={() => open(imageId, job)}>
            {job.name}
            {job.status && <span className="ml-auto pl-3 text-xs text-muted-foreground">{job.status}</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
